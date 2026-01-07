import { io } from 'socket.io-client';

let socket;

export function initSocket() {
  if (!socket) {
    socket = io(process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://localhost:5000');
  }
  return socket;
}

export function joinRooms({ userId, doctorId }) {
  if (!socket) return;
  if (userId) socket.emit('join_room', `user_${userId}`);
  if (doctorId) socket.emit('join_room', `doctor_${doctorId}`);
}

export function getSocket() {
  return socket;
}
