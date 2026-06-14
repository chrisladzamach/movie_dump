import { useNotifications } from '../hooks/useNotifications';

export function NotificationToast() {
  const { notifications, dismissNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] flex flex-col gap-2 max-w-lg mx-auto">
      {notifications.map((notif, index) => (
        <div
          key={`${notif.type}-${notif.movieId}-${index}`}
          className="bg-card border border-primary/30 rounded-xl p-3 shadow-lg animate-slide-in flex items-start gap-3"
          onClick={() => dismissNotification(index)}
        >
          <span className="text-primary text-lg">🔔</span>
          <p className="text-sm text-white flex-1">{notif.content}</p>
        </div>
      ))}
    </div>
  );
}
