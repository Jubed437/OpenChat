#  OpenChat

A modern, feature-rich real-time chat application built with **HTML**, **CSS**, **JavaScript**, and **Socket.IO**. This application allows users to create and join chat rooms, send messages in real-time, and interact with other users seamlessly.

![Chat Application](https://img.shields.io/badge/Status-Production%20Ready-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node Version](https://img.shields.io/badge/Node-%3E%3D14.0.0-green)

---

## Live Demo - 


##  Table of Contents

- [Features](#-features)
- [Technologies Used](#-technologies-used)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [How to Run](#-how-to-run)
- [How to Use](#-how-to-use)
- [Architecture & Design](#-architecture--design)
- [Security Features](#-security-features)
- [Browser Compatibility](#-browser-compatibility)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 User Authentication
- **Unique Username Registration**: Users must choose a unique username before joining the chat
- **Username Validation**: Enforces length requirements (2-20 characters) and allowed characters
- **Duplicate Prevention**: Prevents username impersonation by enforcing uniqueness
- **Input Sanitization**: All inputs are sanitized to prevent XSS attacks

### 💬 Real-Time Messaging
- **Instant Message Delivery**: Messages are delivered in real-time using WebSocket technology
- **Message Timestamps**: Every message displays the sender's name and timestamp
- **Auto-Scroll**: Chat automatically scrolls to the newest message
- **Typing Indicators**: See when other users are typing
- **Message History**: View all messages in the current room

### 🎨 Text Formatting
- **Bold Text**: Use `**text**` or `__text__` for bold formatting
- **Italic Text**: Use `*text*` or `_text*` for italic formatting
- **Code Snippets**: Use `` `text` `` for inline code
- **Auto-Linking**: URLs are automatically converted to clickable links
- **Formatting Toolbar**: Quick access buttons for text formatting
- **Keyboard Shortcuts**: Ctrl+B for bold, Ctrl+I for italic

### 🏠 Room Management
- **Create Rooms**: Users can create new chat rooms with custom names
- **Join Rooms**: Browse and join existing rooms from the sidebar
- **Switch Rooms**: Seamlessly switch between different chat rooms
- **Room List**: View all active rooms with user counts
- **Default Room**: A "General" room is always available
- **Auto-Cleanup**: Empty rooms (except default) are automatically deleted

### 👥 User Experience
- **User List**: See all users currently in your room
- **Join/Leave Notifications**: Get notified when users join or leave
- **Desktop Notifications**: Browser notifications for new messages (when tab is inactive)
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Mobile Sidebar**: Collapsible sidebar for mobile users
- **Dark Theme**: Modern dark theme that's easy on the eyes
- **Smooth Animations**: Beautiful transitions and animations throughout

### 🔒 Security & Performance
- **Input Sanitization**: All user inputs are sanitized to prevent XSS attacks
- **Rate Limiting**: Prevents message flooding (max 10 messages per 5 seconds)
- **Message Length Limits**: Enforces maximum message length (500 characters)
- **Room Name Validation**: Validates room names to prevent abuse
- **Graceful Error Handling**: User-friendly error messages
- **Automatic Reconnection**: Handles disconnections and reconnects automatically

---

## 🛠 Technologies Used

### Backend
- **Node.js**: JavaScript runtime environment
- **Express**: Web application framework for Node.js
- **Socket.IO**: Real-time bidirectional event-based communication
- **Validator**: String validation and sanitization library

### Frontend
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with flexbox, grid, and animations
- **JavaScript (ES6+)**: Client-side logic and Socket.IO client
- **Socket.IO Client**: WebSocket client library

### Development Tools
- **Nodemon**: Auto-restart server during development (dev dependency)

---

## 📁 Project Structure

```
openchat/
├── server/
│   └── server.js          # Socket.IO server with all backend logic
├── client/
│   ├── index.html         # Main HTML structure
│   ├── style.css          # Complete styling and responsive design
│   └── script.js          # Client-side JavaScript and Socket.IO logic
├── package.json           # Project dependencies and scripts
└── README.md             # This file
```

### File Descriptions

- **server/server.js**: 
  - Handles WebSocket connections
  - Manages user authentication and room operations
  - Implements message broadcasting and rate limiting
  - Contains all server-side business logic

- **client/index.html**: 
  - Semantic HTML5 structure
  - Username registration modal
  - Chat interface with sidebar and message area
  - Responsive layout

- **client/style.css**: 
  - Modern dark theme design
  - Responsive layout with mobile support
  - Smooth animations and transitions
  - Custom scrollbar styling

- **client/script.js**: 
  - Socket.IO client integration
  - DOM manipulation and event handling
  - Message formatting and rendering
  - User interaction logic

---

## 📦 Installation

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14.0.0 or higher)
- **npm** (comes with Node.js)

You can check if they're installed by running:
```bash
node --version
npm --version
```

### Step-by-Step Installation

1. **Clone or download this repository**
   ```bash
   cd openchat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

   This will install the following packages:
   - `express` - Web framework
   - `socket.io` - WebSocket library
   - `validator` - Input validation
   - `nodemon` - Development tool (dev dependency)

---

## 🚀 How to Run

### Production Mode

To start the server in production mode:

```bash
npm start
```

### Development Mode

For development with auto-restart on file changes:

```bash
npm run dev
```

### Access the Application

Once the server is running, you'll see:

```
╔════════════════════════════════════════════╗
║   OpenChat Server                          ║
╠════════════════════════════════════════════╣
║   Server running on port 3000            ║
║   http://localhost:3000                  ║
╚════════════════════════════════════════════╝
```

Open your web browser and navigate to:
```
http://localhost:3000
```

### Testing with Multiple Users

To test the chat functionality:
1. Open the application in multiple browser windows or tabs
2. Register with different usernames in each window
3. Create or join the same room
4. Start chatting!

---

## 📖 How to Use

### 1. Registration

When you first open the application:
- Enter a unique username (2-20 characters)
- Username can contain letters, numbers, spaces, hyphens, and underscores
- Click "Join Chat" to proceed

### 2. Creating a Room

- Click the "+ New Room" button in the sidebar
- Enter a room name (up to 30 characters)
- Click "Create" to create the room
- You'll automatically join the new room

### 3. Joining a Room

- Browse the list of available rooms in the sidebar
- Click on any room to join it
- The room will display the number of active users

### 4. Sending Messages

- Type your message in the input box at the bottom
- Press Enter to send (Shift+Enter for new line)
- Or click the send button (➤)

### 5. Text Formatting

**Bold Text**:
- Type: `**your text**` or `__your text__`
- Or: Select text and click the **B** button (or Ctrl+B)

**Italic Text**:
- Type: `*your text*` or `_your text_`
- Or: Select text and click the _I_ button (or Ctrl+I)

**Code**:
- Type: `` `your code` ``
- Or: Select text and click the `</>` button

**Links**:
- Simply type a URL (http:// or https://)
- It will automatically become clickable

### 6. Mobile Usage

On mobile devices:
- Tap the ☰ button to show/hide the sidebar
- The interface adapts to smaller screens
- All features work the same as on desktop

---

## 🏗 Architecture & Design

### Communication Flow

```
Client (Browser)
    ↕ Socket.IO WebSocket Connection
Server (Node.js)
    ↕ Event Broadcasting
All Connected Clients
```

### Key Design Patterns

1. **Event-Driven Architecture**: The application uses Socket.IO's event system for real-time communication

2. **Client-Server Model**: Clear separation between client-side UI and server-side logic

3. **State Management**: 
   - Server maintains authoritative state (users, rooms, connections)
   - Clients maintain local UI state

4. **Modular Code Organization**: 
   - Server: Separate functions for validation, room management, and messaging
   - Client: Separate functions for UI updates, event handling, and formatting

### Socket.IO Events

**Client → Server**:
- `register`: Register username
- `joinRoom`: Join a chat room
- `createRoom`: Create a new room
- `sendMessage`: Send a message
- `typing`: Send typing indicator
- `disconnect`: User disconnects

**Server → Client**:
- `newMessage`: New message received
- `userJoined`: User joined the room
- `userLeft`: User left the room
- `roomListUpdate`: Room list updated
- `userTyping`: User is typing

---

## 🔒 Security Features

### Input Sanitization
- All user inputs are sanitized using the `validator` library
- HTML entities are escaped to prevent XSS attacks
- Script tags are explicitly removed

### Validation
- Username validation (length, allowed characters)
- Room name validation
- Message length validation
- URL validation for links

### Rate Limiting
- Users are limited to 10 messages per 5 seconds
- Prevents spam and server overload

### XSS Prevention
- All user-generated content is escaped before rendering
- HTML injection is not possible

### CSRF Protection
- WebSocket connections use Socket.IO's built-in protection
- No cookies or sessions used

---

## 🌐 Browser Compatibility

The application is compatible with:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Opera (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Requirements
- JavaScript enabled
- WebSocket support (all modern browsers)
- LocalStorage support (for potential future features)

---

## 🚧 Future Enhancements

Potential features for future versions:

### Short-term
- [ ] Private direct messaging between users
- [ ] Message edit and delete functionality
- [ ] Emoji picker
- [ ] File/image sharing
- [ ] Message search

### Medium-term
- [ ] User profiles with avatars
- [ ] Message reactions (like, love, etc.)
- [ ] Voice messages
- [ ] Video chat integration
- [ ] Message threading/replies

### Long-term
- [ ] Persistent message history (database integration)
- [ ] User authentication with passwords
- [ ] End-to-end encryption
- [ ] Mobile apps (React Native)
- [ ] Desktop app (Electron)
- [ ] Admin panel for room moderation

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/AmazingFeature`
3. **Commit your changes**: `git commit -m 'Add some AmazingFeature'`
4. **Push to the branch**: `git push origin feature/AmazingFeature`
5. **Open a Pull Request**

### Coding Guidelines
- Follow the existing code style
- Comment your code where necessary
- Test your changes thoroughly
- Update documentation if needed

---

## 📄 License

## 🚀 Deployment on Vercel

### Prerequisites for Deployment
- GitHub account
- Vercel account (free)
- Your project pushed to a GitHub repository

### Step-by-Step Deployment

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/openchat.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in with GitHub
   - Click "New Project"
   - Import your OpenChat repository
   - Vercel will automatically detect it's a Node.js project
   - Click "Deploy"

3. **Configuration**
   - The `vercel.json` file is already configured for your project
   - No additional environment variables needed for basic functionality

4. **Access your deployed app**
   - Your app will be available at `https://your-project-name.vercel.app`
   - Share this URL with others to use your chat application

### Important Notes for Vercel Deployment
- Socket.IO works perfectly with Vercel's serverless functions
- The app will automatically scale based on usage
- HTTPS is enabled by default
- Custom domains can be added in Vercel dashboard

---

## 📄 License

This project is licensed under the MIT License - see below for details:

```
MIT License

Copyright (c) 2025 Chat Application

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👨‍💻 Author

Created as a final-year academic project demonstrating:
- Real-time communication systems
- Full-stack web development
- WebSocket technology
- Modern JavaScript practices
- Responsive web design
- Security best practices

---

## 📞 Support

If you encounter any issues or have questions:
1. Check the [How to Use](#-how-to-use) section
2. Review the [Troubleshooting](#troubleshooting) section below
3. Open an issue on the project repository

### Troubleshooting

**Server won't start:**
- Ensure Node.js is installed correctly
- Check if port 3000 is available
- Run `npm install` to ensure dependencies are installed

**Can't connect to the server:**
- Make sure the server is running
- Check your firewall settings
- Try accessing `http://localhost:3000` directly

**Messages not sending:**
- Check your internet connection
- Ensure you've joined a room
- Check the browser console for errors

**Username already taken:**
- Choose a different username
- Usernames are case-insensitive

---

## 🎓 Academic Information

This project demonstrates proficiency in:

- **Web Technologies**: HTML5, CSS3, JavaScript (ES6+)
- **Real-Time Communication**: WebSocket, Socket.IO
- **Backend Development**: Node.js, Express
- **Frontend Development**: DOM manipulation, Event handling
- **Software Engineering**: Modular design, Code documentation
- **Security**: Input validation, XSS prevention, Rate limiting
- **UX/UI Design**: Responsive design, Accessibility
- **Version Control**: Git, GitHub

### Learning Outcomes
- Understanding of real-time web applications
- Client-server architecture
- WebSocket protocol and Socket.IO
- Security best practices
- Responsive web design
- User experience optimization

---

## 🌟 Acknowledgments

- Socket.IO team for the excellent real-time library
- Express.js for the lightweight web framework
- The open-source community for inspiration and best practices

---

<div align="center">

**Built with ❤️ using HTML, CSS, JavaScript, and Socket.IO**

[⬆ Back to Top](#-openchat)

</div>
