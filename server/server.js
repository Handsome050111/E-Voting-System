const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
    console.warn('⚠️ WARNING: JWT_SECRET is not defined in environment variables! Logins will fail.');
}

const app = express();
const server = http.createServer(app);

let lastDbError = null;

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
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));

// Diagnostic Route (Moved to top)
app.get('/api/health', (req, res) => {
    const fs = require('fs');
    const localDist = path.join(__dirname, 'dist');
    res.json({
        status: 'ok',
        time: new Date(),
        dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        dbState: mongoose.connection.readyState,
        dbError: lastDbError ? lastDbError.message : null,
        uriExists: !!process.env.MONGODB_URI,
        env: process.env.NODE_ENV,
        localDistExists: fs.existsSync(localDist),
    });
});

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
    .then(() => {
        console.log('MongoDB Connected');
        lastDbError = null;
    })
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        lastDbError = err;
    });

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/elections', require('./routes/electionRoutes'));
app.use('/api/candidates', require('./routes/candidateRoutes'));
app.use('/api/votes', require('./routes/voteRoutes'));

// Serve Static Files
const distPath = path.resolve(__dirname, '..', 'client', 'dist');
console.log('Serving production assets from:', distPath);

app.use(express.static(distPath));

// Wildcard route for React Router
app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (require('fs').existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Application build not found at: ' + indexPath);
    }
});

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
