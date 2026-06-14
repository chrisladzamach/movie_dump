import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import { NotificationEvent } from '../models/types';

let io: Server | null = null;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) {
      next(new Error('Authentication error'));
      return;
    }
    try {
      const payload = verifyToken(token);
      socket.data.user = payload;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user?.userId;
    if (userId) {
      socket.join('movie-dump');
      socket.join(`user-${userId}`);
    }

    socket.on('disconnect', () => {
      // cleanup handled by socket.io
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

export function emitNotification(event: NotificationEvent, excludeUserId?: number): void {
  if (!io) return;

  io.to('movie-dump').emit('notification', {
    ...event,
    timestamp: new Date().toISOString(),
    excludeUserId,
  });
}

export function emitDataUpdate(type: string, payload: unknown): void {
  if (!io) return;
  io.to('movie-dump').emit('data_update', { type, payload, timestamp: new Date().toISOString() });
}
