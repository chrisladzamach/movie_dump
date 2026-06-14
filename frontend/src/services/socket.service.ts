import { io, Socket } from 'socket.io-client';
import { NotificationEvent } from '../types';

let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket;

  const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

  socket = io(url, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}

export function onNotification(callback: (event: NotificationEvent) => void): () => void {
  if (!socket) return () => undefined;
  socket.on('notification', callback);
  return () => socket?.off('notification', callback);
}

export function onDataUpdate(callback: (data: { type: string; payload: unknown }) => void): () => void {
  if (!socket) return () => undefined;
  socket.on('data_update', callback);
  return () => socket?.off('data_update', callback);
}
