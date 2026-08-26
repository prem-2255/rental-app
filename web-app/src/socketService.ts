import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let currentUserId: string | null = null;

export const connectSocket = (userId: string): Socket => {
  // If we already have a socket for the same user, return it
  if (socket && currentUserId === userId) {
    return socket;
  }

  // Otherwise, disconnect the old socket and create a new one
  if (socket) {
    socket.disconnect();
  }

  currentUserId = userId;
  socket = io(window.location.origin, {
    auth: { token: localStorage.getItem('token') },
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('⚡ Connected to socket server, socket ID:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Disconnected from socket server, reason:', reason);
    // Clear the userId on disconnect so that a new connection will be forced if needed
    currentUserId = null;
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentUserId = null;
  }
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const sendSocketMessage = (senderId: string, receiverId: string, text: string) => {
  if (socket) {
    socket.emit('send-message', { senderId, receiverId, text });
  } else {
    console.warn('⚠️ Cannot send message: Socket is not connected');
  }
};
