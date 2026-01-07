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
const userRoutes = require('./routes/user/userRoutes');

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
app.use(cors({ origin: "http://localhost:4200", credentials: true }));
app.use(express.json());
app.use(require('cookie-parser')());

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  // Log incoming request
  console.log(`\n[${timestamp}] ${req.method} ${req.originalUrl}`);
  console.log(`IP: ${req.ip} | User-Agent: ${req.get('User-Agent') || 'Unknown'}`);

  // Log headers (excluding sensitive ones)
  const safeHeaders = { ...req.headers };
  delete safeHeaders.authorization;
  delete safeHeaders['x-auth-token'];
  console.log(`Headers:`, JSON.stringify(safeHeaders, null, 2));

  // Log request body for POST/PUT/PATCH requests (excluding sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const safeBody = { ...req.body };
    // Remove sensitive fields
    delete safeBody.password;
    delete safeBody.token;
    console.log(`Body:`, JSON.stringify(safeBody, null, 2));
  }

  // Log query parameters
  if (Object.keys(req.query).length > 0) {
    console.log(`Query:`, JSON.stringify(req.query, null, 2));
  }

  // Log response
  const originalSend = res.send;
  const originalJson = res.json;

  const logResponse = (data) => {
    const duration = Date.now() - startTime;
    const responseTimestamp = new Date().toISOString();
    console.log(`[${responseTimestamp}] Response: ${res.statusCode} | Duration: ${duration}ms`);

    // Log response data for non-GET requests or errors
    if (res.statusCode >= 400 || !req.method === 'GET') {
      try {
        const responseData = typeof data === 'string' ? JSON.parse(data) : data;
        console.log(`Response Data:`, JSON.stringify(responseData, null, 2));
      } catch (e) {
        console.log(`Response Data: ${data}`);
      }
    }
    console.log(`--- End Request ---\n`);
  };

  res.send = function(data) {
    logResponse(data);
    return originalSend.call(this, data);
  };

  res.json = function(data) {
    logResponse(data);
    return originalJson.call(this, data);
  };

  next();
});

// serve static files for uploads
app.use('/uploads', express.static('uploads'));

// init socket.io
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: ["http://localhost:4200", "http://localhost:4201"], credentials: true } });

require('./sockets/socket')(io);

// register auth routes
// app.use('/auth/login', loginLimiter); // Temporarily disabled for testing
app.use('/auth', authRoutes);

// register follow routes
app.use('/follow', followRoutes);

// register hashtag routes
app.use('/hashtag', hashtagRoutes);

// register post routes
app.use('/posts', postRoutes);

// register comment routes
app.use('/posts', commentRoutes);

// register like routes
app.use('/posts', likeRoutes);

// register feed routes
app.use('/feed', feedRoutes);

// register message routes
app.use('/messages', messageRoutes);

// register notification routes
app.use('/notification', notificationRoutes);

// register search routes
app.use('/search', searchRoutes);

// register user routes
app.use('/users', userRoutes);

// Error handling middleware
const errorHandler = require('./middlewares/error/errorHandler');
app.use(errorHandler);

// start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));