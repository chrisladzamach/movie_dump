import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { NotificationEvent } from '../types';
import { onNotification, onDataUpdate } from '../services/socket.service';
import { useAuth } from './useAuth';

interface NotificationContextValue {
  notifications: NotificationEvent[];
  dismissNotification: (index: number) => void;
  refreshKey: number;
  triggerRefresh: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

function getNotificationMessage(event: NotificationEvent): string {
  switch (event.type) {
    case 'movie_registered':
      return `${event.username} registró "${event.movieTitle}"`;
    case 'movie_updated':
      return `${event.username} actualizó "${event.movieTitle}"`;
    case 'comment_added':
      return `${event.username} comentó en "${event.movieTitle}"`;
    case 'watchlist_added':
      return `${event.username} agregó "${event.movieTitle}" a su watchlist`;
    case 'watchlist_watched':
      return `${event.username} marcó "${event.movieTitle}" como vista`;
    default:
      return 'Nueva actividad';
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const dismissNotification = useCallback((index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  }, []);

  useEffect(() => {
    if (!token || !user) return;

    const unsubNotify = onNotification((event) => {
      if (event.excludeUserId === user.id) return;
      setNotifications((prev) => [
        { ...event, content: getNotificationMessage(event) },
        ...prev.slice(0, 4),
      ]);
    });

    const unsubUpdate = onDataUpdate(() => {
      triggerRefresh();
    });

    return () => {
      unsubNotify();
      unsubUpdate();
    };
  }, [token, user, triggerRefresh]);

  return (
    <NotificationContext.Provider
      value={{ notifications, dismissNotification, refreshKey, triggerRefresh }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
}
