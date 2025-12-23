require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth/authRoutes');

// connect database
connectDB();

// init express app
const app = express();

// enable cors & json
app.use(cors());
app.use(express.json());

// init socket.io
const server = http.createServer(app);
const io = socketIo(server);

// register auth routes
app.use('/auth', authRoutes);

// start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));