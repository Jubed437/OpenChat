let socket = null;
let currentUsername = '';
let currentRoom = '';
let typingTimeout = null;
let isTyping = false;

const elements = {
    usernameModal: document.getElementById('usernameModal'),
    usernameForm: document.getElementById('usernameForm'),
    usernameInput: document.getElementById('usernameInput'),
    usernameError: document.getElementById('usernameError'),
    joinBtn: document.getElementById('joinBtn'),
    chatContainer: document.getElementById('chatContainer'),
    currentUsernameDisplay: document.getElementById('currentUsername'),
    logoutBtn: document.getElementById('logoutBtn'),
    sidebar: document.getElementById('sidebar'),
    toggleSidebar: document.getElementById('toggleSidebar'),
    createRoomBtn: document.getElementById('createRoomBtn'),
    createRoomForm: document.getElementById('createRoomForm'),
    newRoomInput: document.getElementById('newRoomInput'),
    confirmCreateRoom: document.getElementById('confirmCreateRoom'),
    cancelCreateRoom: document.getElementById('cancelCreateRoom'),
    roomError: document.getElementById('roomError'),
    roomList: document.getElementById('roomList'),
    usersList: document.getElementById('usersList'),
    currentRoomName: document.getElementById('currentRoomName'),
    roomUserCount: document.getElementById('roomUserCount'),
    messagesContainer: document.getElementById('messagesContainer'),
    typingIndicator: document.getElementById('typingIndicator'),
    messageForm: document.getElementById('messageForm'),
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    charCount: document.getElementById('charCount'),
    messageError: document.getElementById('messageError'),
    notificationContainer: document.getElementById('notificationContainer')
};

function init() {
    elements.usernameInput.focus();
    setupEventListeners();
    initializeSocket();
}

function initializeSocket() {
    // Use the current domain for socket connection in production
    const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin;
    socket = io(socketUrl);
    
    socket.on('connect', () => {
        console.log('Connected to server');
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        showNotification('Connection lost. Reconnecting...', 'warning');
    });
    
    socket.on('reconnect', () => {
        showNotification('Reconnected to server', 'success');
        if (currentUsername && currentRoom) {
            registerUser(currentUsername);
        }
    });
    
    socket.on('newMessage', handleNewMessage);
    socket.on('userJoined', handleUserJoined);
    socket.on('userLeft', handleUserLeft);
    socket.on('roomListUpdate', handleRoomListUpdate);
    socket.on('userTyping', handleUserTyping);
}

function setupEventListeners() {
    elements.usernameForm.addEventListener('submit', handleUsernameSubmit);
    elements.logoutBtn.addEventListener('click', handleLogout);
    elements.toggleSidebar.addEventListener('click', toggleSidebar);
    elements.createRoomBtn.addEventListener('click', showCreateRoomForm);
    elements.confirmCreateRoom.addEventListener('click', handleCreateRoom);
    elements.cancelCreateRoom.addEventListener('click', hideCreateRoomForm);
    elements.messageForm.addEventListener('submit', handleMessageSubmit);
    elements.messageInput.addEventListener('input', handleMessageInput);
    elements.messageInput.addEventListener('keydown', handleMessageKeydown);
    
    document.querySelectorAll('.format-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            handleFormatting(btn.dataset.format);
        });
    });
    
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function handleUsernameSubmit(e) {
    e.preventDefault();
    const username = elements.usernameInput.value.trim();
    
    if (!username) {
        showError(elements.usernameError, 'Please enter a username');
        return;
    }
    
    elements.joinBtn.disabled = true;
    elements.joinBtn.textContent = 'Joining...';
    registerUser(username);
}

function registerUser(username) {
    socket.emit('register', username, (response) => {
        if (response.success) {
            currentUsername = response.username;
            elements.usernameModal.classList.add('hidden');
            elements.chatContainer.classList.remove('hidden');
            elements.currentUsernameDisplay.textContent = currentUsername;
            showNotification(`Welcome, ${currentUsername}!`, 'success');
            
            if (response.rooms) {
                updateRoomList(response.rooms);
            }
        } else {
            showError(elements.usernameError, response.error);
            elements.joinBtn.disabled = false;
            elements.joinBtn.textContent = 'Join Chat';
        }
    });
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        socket.disconnect();
        currentUsername = '';
        currentRoom = '';
        elements.chatContainer.classList.add('hidden');
        elements.usernameModal.classList.remove('hidden');
        elements.usernameInput.value = '';
        elements.usernameError.textContent = '';
        elements.messagesContainer.innerHTML = '<div class="welcome-message"><h3>👋 Welcome to OpenChat!</h3><p>Select a room from the sidebar or create a new one to start chatting</p></div>';
        socket.connect();
        showNotification('Logged out successfully', 'success');
    }
}

function showCreateRoomForm() {
    elements.createRoomForm.classList.remove('hidden');
    elements.newRoomInput.focus();
}

function hideCreateRoomForm() {
    elements.createRoomForm.classList.add('hidden');
    elements.newRoomInput.value = '';
    elements.roomError.textContent = '';
}

function handleCreateRoom() {
    const roomName = elements.newRoomInput.value.trim();
    
    if (!roomName) {
        showError(elements.roomError, 'Please enter a room name');
        return;
    }
    
    socket.emit('createRoom', roomName, (response) => {
        if (response.success) {
            hideCreateRoomForm();
            showNotification(`Room "${response.roomName}" created!`, 'success');
            joinRoom(response.roomName);
        } else {
            showError(elements.roomError, response.error);
        }
    });
}

function joinRoom(roomName) {
    socket.emit('joinRoom', roomName, (response) => {
        if (response.success) {
            currentRoom = response.room;
            elements.messagesContainer.innerHTML = '';
            elements.currentRoomName.textContent = `# ${currentRoom}`;
            elements.messageInput.disabled = false;
            elements.sendBtn.disabled = false;
            updateUsersList(response.users);
            addSystemMessage(`You joined #${currentRoom}`);
            elements.messageInput.focus();
            
            if (window.innerWidth <= 768) {
                elements.sidebar.classList.remove('active');
            }
        } else {
            showNotification(response.error, 'error');
        }
    });
}

function updateRoomList(rooms) {
    elements.roomList.innerHTML = '';
    
    rooms.forEach(room => {
        const roomItem = document.createElement('div');
        roomItem.className = 'room-item';
        if (room.name === currentRoom) {
            roomItem.classList.add('active');
        }
        
        roomItem.innerHTML = `
            <div class="room-item-name"># ${escapeHtml(room.name)}</div>
            <div class="room-item-count">${room.userCount} ${room.userCount === 1 ? 'user' : 'users'}</div>
        `;
        
        roomItem.addEventListener('click', () => joinRoom(room.name));
        
        elements.roomList.appendChild(roomItem);
    });
}

function updateUsersList(users) {
    elements.usersList.innerHTML = '';
    elements.roomUserCount.textContent = `${users.length} ${users.length === 1 ? 'user' : 'users'}`;
    
    users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.textContent = user;
        
        if (user === currentUsername) {
            userItem.style.fontWeight = 'bold';
            userItem.style.color = 'var(--primary-color)';
        }
        
        elements.usersList.appendChild(userItem);
    });
}

function handleRoomListUpdate(rooms) {
    updateRoomList(rooms);
}

function toggleSidebar() {
    elements.sidebar.classList.toggle('active');
}

function handleMessageSubmit(e) {
    e.preventDefault();
    const message = elements.messageInput.value.trim();
    
    if (!message) return;
    
    if (!currentRoom) {
        showNotification('Please join a room first', 'warning');
        return;
    }
    
    socket.emit('sendMessage', { message }, (response) => {
        if (response.success) {
            elements.messageInput.value = '';
            updateCharCount();
            elements.messageError.textContent = '';
            
            if (isTyping) {
                socket.emit('typing', false);
                isTyping = false;
            }
            
            elements.messageInput.style.height = 'auto';
        } else {
            showError(elements.messageError, response.error);
        }
    });
}

function handleMessageInput() {
    updateCharCount();
    elements.messageInput.style.height = 'auto';
    elements.messageInput.style.height = elements.messageInput.scrollHeight + 'px';
    
    if (!isTyping && elements.messageInput.value.trim()) {
        socket.emit('typing', true);
        isTyping = true;
    }
    
    clearTimeout(typingTimeout);
    
    // Stop typing indicator after 2 seconds of inactivity
    typingTimeout = setTimeout(() => {
        if (isTyping) {
            socket.emit('typing', false);
            isTyping = false;
        }
    }, 2000);
}

function handleMessageKeydown(e) {
    // Shift+Enter creates new line, Enter sends message
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        elements.messageForm.dispatchEvent(new Event('submit'));
    }
}

function updateCharCount() {
    const length = elements.messageInput.value.length;
    elements.charCount.textContent = `${length}/500`;
    
    if (length > 450) {
        elements.charCount.style.color = 'var(--warning-color)';
    } else if (length > 480) {
        elements.charCount.style.color = 'var(--danger-color)';
    } else {
        elements.charCount.style.color = 'var(--text-muted)';
    }
}

function handleNewMessage(message) {
    addMessage(message);
    if (document.hidden && message.username !== currentUsername) {
        showBrowserNotification(message.username, message.message);
    }
}

function addMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.dataset.messageId = message.id;
    const timestamp = formatTimestamp(message.timestamp);
    const formattedMessage = formatMessageContent(message.message);
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <span class="message-sender">${escapeHtml(message.username)}</span>
            <span class="message-timestamp">${timestamp}</span>
        </div>
        <div class="message-content">${formattedMessage}</div>
    `;
    
    elements.messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function addSystemMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'system-message';
    messageDiv.textContent = text;
    elements.messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function formatMessageContent(text) {
    let formatted = escapeHtml(text);
    // Format: **bold**, *italic*, `code`, URLs
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/__(.+?)__/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/_(.+?)_/g, '<em>$1</em>');
    formatted = formatted.replace(/`(.+?)`/g, '<code>$1</code>');
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    formatted = formatted.replace(urlPattern, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    return formatted;
}

function handleFormatting(format) {
    const start = elements.messageInput.selectionStart;
    const end = elements.messageInput.selectionEnd;
    const text = elements.messageInput.value;
    const selectedText = text.substring(start, end);
    
    let formattedText = '';
    let cursorOffset = 0;
    
    switch (format) {
        case 'bold':
            formattedText = `**${selectedText}**`;
            cursorOffset = selectedText ? 0 : 2;
            break;
        case 'italic':
            formattedText = `*${selectedText}*`;
            cursorOffset = selectedText ? 0 : 1;
            break;
        case 'code':
            formattedText = `\`${selectedText}\``;
            cursorOffset = selectedText ? 0 : 1;
            break;
    }
    
    elements.messageInput.value = text.substring(0, start) + formattedText + text.substring(end);
    const newCursorPos = selectedText ? end + formattedText.length - selectedText.length : start + formattedText.length - cursorOffset;
    elements.messageInput.setSelectionRange(newCursorPos, newCursorPos);
    elements.messageInput.focus();
    updateCharCount();
}

function handleKeyboardShortcuts(e) {
    if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        handleFormatting('bold');
    }
    
    if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        handleFormatting('italic');
    }
}

function handleUserJoined(data) {
    if (data.room === currentRoom) {
        addSystemMessage(`${data.username} joined the room`);
        updateUsersList(data.users);
        showNotification(`${data.username} joined`, 'success');
    }
}

function handleUserLeft(data) {
    if (data.room === currentRoom) {
        addSystemMessage(`${data.username} left the room`);
        updateUsersList(data.users);
    }
}

function handleUserTyping(data) {
    const typingText = elements.typingIndicator.querySelector('.typing-text');
    
    if (data.isTyping) {
        typingText.textContent = `${data.username} is typing`;
        elements.typingIndicator.classList.remove('hidden');
    } else {
        elements.typingIndicator.classList.add('hidden');
    }
}

function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.textContent = '';
        element.style.display = 'none';
    }, 5000);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    elements.notificationContainer.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in-out';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function showBrowserNotification(username, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`${username} in #${currentRoom}`, {
            body: message.substring(0, 100),
            icon: '/favicon.ico'
        });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
}

function scrollToBottom() {
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    
    if (date.getFullYear() === now.getFullYear()) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Prevent XSS attacks by escaping HTML special characters
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

if ('Notification' in window && Notification.permission === 'default') {
    setTimeout(() => Notification.requestPermission(), 3000);
}
