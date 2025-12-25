require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth/authRoutes');
const followRoutes = require('./routes/follow/followRoutes');
const hashtagRoutes = require('./routes/hashtag/hashtagRoutes');
const postRoutes = require('./routes/post/postRoutes');
const commentRoutes = require('./routes/comment/commentRoutes');
const likeRoutes = require('./routes/like/likeRoutes');
const feedRoutes = require('./routes/feed/feedRoutes');
const messageRoutes = require('./routes/message/messageRoutes');
const notificationRoutes = require('./routes/notification/notificationRoutes');
const searchRoutes = require('./routes/search/searchRoutes');

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many login attempts, please try again later.'
});

const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many posts, please slow down.'
});

const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many comments, please slow down.'
});

const followLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many follow actions, please slow down.'
});

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

require('./sockets/socket')(io);

// register auth routes
app.use('/auth/login', loginLimiter);
app.use('/auth', authRoutes);

// register follow routes
app.use('/follow', followRoutes);

// register hashtag routes
app.use('/hashtag', hashtagRoutes);

// register post routes
app.use('/post', postRoutes);

// register comment routes
app.use('/comment', commentRoutes);

// register like routes
app.use('/like', likeRoutes);

// register feed routes
app.use('/feed', feedRoutes);

// register message routes
app.use('/message', messageRoutes);

// register notification routes
app.use('/notification', notificationRoutes);

// register search routes
app.use('/search', searchRoutes);

// Error handling middleware
const errorHandler = require('./middlewares/error/errorHandler');
app.use(errorHandler);

// start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));