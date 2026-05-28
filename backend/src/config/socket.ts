import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

export let io: Server;

export function initSocket(httpServer: HttpServer) {
  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map(s => s.trim());
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('join', (id: string) => socket.join(id));
    socket.on('join:assignment', (id: string) => socket.join(id));
  });
}
