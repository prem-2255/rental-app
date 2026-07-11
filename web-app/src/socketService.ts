import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectSocket = (userId: string): Socket => {
  if (socket) {
    socket.disconnect();
  }

  // Connects via window.location (proxied in dev, direct in prod)
  socket = io(window.location.origin, {
    query: { userId },
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('⚡ Connected to socket server, socket ID:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Disconnected from socket server, reason:', reason);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
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
