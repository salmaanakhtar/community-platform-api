require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth/authRoutes');
const followRoutes = require('./routes/follow/followRoutes');
const hashtagRoutes = require('./routes/hashtag/hashtagRoutes');
const postRoutes = require('./routes/post/postRoutes');

// connect database
connectDB();

// init express app
const app = express();

// enable cors & json
app.use(cors());
app.use(express.json());

// serve static files for uploads
app.use('/uploads', express.static('uploads'));

// init socket.io
const server = http.createServer(app);
const io = socketIo(server);

// register auth routes
app.use('/auth', authRoutes);

// register follow routes
app.use('/follow', followRoutes);

// register hashtag routes
app.use('/hashtag', hashtagRoutes);

// register post routes
app.use('/post', postRoutes);

// start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));