require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./src/config/db');
const routes = require('./src/routes');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: { origin: '*' }
});

// Simple socket events placeholder
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('join_room', (room) => socket.join(room));

  // WebRTC signaling events
  socket.on('webrtc_offer', (offer) => {
    // broadcast to other participants in the same session (simple demo)
    socket.broadcast.emit('webrtc_offer', offer);
  });
  socket.on('webrtc_answer', (answer) => {
    socket.broadcast.emit('webrtc_answer', answer);
  });
  socket.on('webrtc_ice_candidate', (candidate) => {
    socket.broadcast.emit('webrtc_ice_candidate', candidate);
  });
});

// attach io to app for controllers to use
app.set('io', io);

// middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// routes
app.use('/api', routes);

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to DB', err);
    process.exit(1);
  });