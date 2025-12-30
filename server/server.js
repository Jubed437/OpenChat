const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const validator = require('validator');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling']
});

const PORT = process.env.PORT || 3000;
const MAX_USERNAME_LENGTH = 20;
const MIN_USERNAME_LENGTH = 2;
const MAX_MESSAGE_LENGTH = 500;
// Rate limiting: max 10 messages per 5 seconds
const RATE_LIMIT_MESSAGES = 10;
const RATE_LIMIT_INTERVAL = 5000;

// LiveReload setup for development
if (process.env.NODE_ENV !== 'production') {
    const livereload = require('livereload');
    const connectLivereload = require('connect-livereload');
    
    const liveReloadServer = livereload.createServer();
    liveReloadServer.watch(path.join(__dirname, '../client'));
    
    liveReloadServer.server.once('connection', () => {
        setTimeout(() => {
            liveReloadServer.refresh('/');
        }, 100);
    });
    
    app.use(connectLivereload());
}

app.use(express.static(path.join(__dirname, '../client')));

const users = new Map();
const rooms = new Map();
const usernames = new Set();

const DEFAULT_ROOM = 'General';
rooms.set(DEFAULT_ROOM, new Set());

function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    let sanitized = validator.escape(input.trim());
    // Remove any script tags to prevent XSS attacks
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    return sanitized;
}

function validateUsername(username) {
    if (!username || username.trim().length === 0) {
        return { valid: false, error: 'Username cannot be empty' };
    }
    
    const sanitized = sanitizeInput(username);
    
    if (sanitized.length < MIN_USERNAME_LENGTH) {
        return { valid: false, error: `Username must be at least ${MIN_USERNAME_LENGTH} characters` };
    }
    
    if (sanitized.length > MAX_USERNAME_LENGTH) {
        return { valid: false, error: `Username must be less than ${MAX_USERNAME_LENGTH} characters` };
    }
    
    // Only allow alphanumeric, spaces, hyphens, and underscores
    if (!/^[a-zA-Z0-9_\- ]+$/.test(sanitized)) {
        return { valid: false, error: 'Username can only contain letters, numbers, spaces, hyphens, and underscores' };
    }
    
    return { valid: true, sanitized };
}

function isRateLimited(socketId) {
    const user = users.get(socketId);
    if (!user) return false;
    
    const now = Date.now();
    
    if (now - user.lastReset > RATE_LIMIT_INTERVAL) {
        user.messageCount = 0;
        user.lastReset = now;
    }
    
    if (user.messageCount >= RATE_LIMIT_MESSAGES) {
        return true;
    }
    
    user.messageCount++;
    return false;
}

function getRoomList() {
    const roomList = [];
    rooms.forEach((userSet, roomName) => {
        roomList.push({
            name: roomName,
            userCount: userSet.size
        });
    });
    return roomList;
}

function getRoomUsers(roomName) {
    const userSet = rooms.get(roomName);
    if (!userSet) return [];
    
    const userList = [];
    userSet.forEach(socketId => {
        const user = users.get(socketId);
        if (user) {
            userList.push(user.username);
        }
    });
    return userList;
}

function leaveRoom(socketId, roomName) {
    const userSet = rooms.get(roomName);
    if (userSet) {
        userSet.delete(socketId);
        
        // Auto-delete empty rooms except the default room
        if (userSet.size === 0 && roomName !== DEFAULT_ROOM) {
            rooms.delete(roomName);
        }
    }
}

io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);
    
    socket.on('register', (username, callback) => {
        const validation = validateUsername(username);
        
        if (!validation.valid) {
            return callback({ success: false, error: validation.error });
        }
        
        const sanitizedUsername = validation.sanitized;
        
        if (usernames.has(sanitizedUsername.toLowerCase())) {
            return callback({ 
                success: false, 
                error: 'Username is already taken. Please choose another.' 
            });
        }
        
        users.set(socket.id, {
            username: sanitizedUsername,
            currentRoom: null,
            messageCount: 0,
            lastReset: Date.now()
        });
        
        usernames.add(sanitizedUsername.toLowerCase());
        
        console.log(`User registered: ${sanitizedUsername} (${socket.id})`);
        
        callback({ 
            success: true, 
            username: sanitizedUsername,
            rooms: getRoomList()
        });
    });
    
    socket.on('joinRoom', (roomName, callback) => {
        const user = users.get(socket.id);
        
        if (!user) {
            return callback({ success: false, error: 'User not registered' });
        }
        
        const sanitizedRoomName = sanitizeInput(roomName);
        
        if (!sanitizedRoomName || sanitizedRoomName.length === 0) {
            return callback({ success: false, error: 'Invalid room name' });
        }
        
        if (sanitizedRoomName.length > 30) {
            return callback({ success: false, error: 'Room name too long' });
        }
        
        if (user.currentRoom) {
            socket.leave(user.currentRoom);
            leaveRoom(socket.id, user.currentRoom);
            
            io.to(user.currentRoom).emit('userLeft', {
                username: user.username,
                room: user.currentRoom,
                users: getRoomUsers(user.currentRoom)
            });
            
            io.emit('roomListUpdate', getRoomList());
        }
        
        if (!rooms.has(sanitizedRoomName)) {
            rooms.set(sanitizedRoomName, new Set());
        }
        
        socket.join(sanitizedRoomName);
        rooms.get(sanitizedRoomName).add(socket.id);
        user.currentRoom = sanitizedRoomName;
        
        console.log(`${user.username} joined room: ${sanitizedRoomName}`);
        
        socket.to(sanitizedRoomName).emit('userJoined', {
            username: user.username,
            room: sanitizedRoomName,
            users: getRoomUsers(sanitizedRoomName)
        });
        
        io.emit('roomListUpdate', getRoomList());
        
        callback({ 
            success: true, 
            room: sanitizedRoomName,
            users: getRoomUsers(sanitizedRoomName)
        });
    });
    
    socket.on('sendMessage', (messageData, callback) => {
        const user = users.get(socket.id);
        
        if (!user) {
            return callback({ success: false, error: 'User not registered' });
        }
        
        if (!user.currentRoom) {
            return callback({ success: false, error: 'Not in a room' });
        }
        
        if (isRateLimited(socket.id)) {
            return callback({ 
                success: false, 
                error: 'Sending messages too quickly. Please slow down.' 
            });
        }
        
        const sanitizedMessage = sanitizeInput(messageData.message);
        
        if (!sanitizedMessage || sanitizedMessage.length === 0) {
            return callback({ success: false, error: 'Message cannot be empty' });
        }
        
        if (sanitizedMessage.length > MAX_MESSAGE_LENGTH) {
            return callback({ 
                success: false, 
                error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters.` 
            });
        }
        
        const message = {
            id: `${socket.id}-${Date.now()}`,
            username: user.username,
            message: sanitizedMessage,
            timestamp: new Date().toISOString(),
            room: user.currentRoom
        };
        
        io.to(user.currentRoom).emit('newMessage', message);
        
        console.log(`Message from ${user.username} in ${user.currentRoom}: ${sanitizedMessage}`);
        
        callback({ success: true });
    });
    
    socket.on('createRoom', (roomName, callback) => {
        const user = users.get(socket.id);
        
        if (!user) {
            return callback({ success: false, error: 'User not registered' });
        }
        
        const sanitizedRoomName = sanitizeInput(roomName);
        
        if (!sanitizedRoomName || sanitizedRoomName.length === 0) {
            return callback({ success: false, error: 'Room name cannot be empty' });
        }
        
        if (sanitizedRoomName.length > 30) {
            return callback({ success: false, error: 'Room name too long (max 30 characters)' });
        }
        
        if (rooms.has(sanitizedRoomName)) {
            return callback({ 
                success: false, 
                error: 'Room already exists. Join it instead.' 
            });
        }
        
        rooms.set(sanitizedRoomName, new Set());
        
        console.log(`Room created: ${sanitizedRoomName} by ${user.username}`);
        
        io.emit('roomListUpdate', getRoomList());
        
        callback({ success: true, roomName: sanitizedRoomName });
    });
    
    socket.on('typing', (isTyping) => {
        const user = users.get(socket.id);
        
        if (user && user.currentRoom) {
            socket.to(user.currentRoom).emit('userTyping', {
                username: user.username,
                isTyping: isTyping
            });
        }
    });
    
    socket.on('disconnect', () => {
        const user = users.get(socket.id);
        
        if (user) {
            console.log(`User disconnected: ${user.username} (${socket.id})`);
            
            if (user.currentRoom) {
                leaveRoom(socket.id, user.currentRoom);
                
                io.to(user.currentRoom).emit('userLeft', {
                    username: user.username,
                    room: user.currentRoom,
                    users: getRoomUsers(user.currentRoom)
                });
            }
            
            usernames.delete(user.username.toLowerCase());
            
            users.delete(socket.id);
            
            io.emit('roomListUpdate', getRoomList());
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
   
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});
