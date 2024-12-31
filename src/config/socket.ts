import "dotenv/config";
import { Server } from 'socket.io';

// This function initializes the Socket.IO events
export function initSocketServer(httpServer: any) {

  const allowedOrigins = new Set(
    (process.env.ALLOWED_ORIGINS ?? '').split(',').map(origin => origin.trim())
  );

  const io = new Server(httpServer, {
    cors: {
      origin: function (origin, callback) {
        // Ensure 'origin' is a string before passing to has()
        if (allowedOrigins.has(origin ?? '') || !origin) {
          callback(null, true);
        } else {
          callback(new Error('CORS not allowed'), false);
        }
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected');
    // Here you can handle Socket.IO events, like disconnection, messages, etc.
    
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  return io;
}