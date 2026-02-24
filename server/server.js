const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for simplicity in this demo, or configure it properly
}));

// Make io available in routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voting-system', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/elections', require('./routes/electionRoutes'));
app.use('/api/candidates', require('./routes/candidateRoutes'));
app.use('/api/votes', require('./routes/voteRoutes'));

// Serve Static Files in Production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.send('Online Voting System API (Development Mode)');
    });
}

// Socket.io Connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
