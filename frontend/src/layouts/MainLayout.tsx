import { Outlet } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { NotificationToast } from '../components/NotificationToast';

export function MainLayout() {
  return (
    <div className="min-h-dvh bg-background pb-20">
      <NotificationToast />
      <main className="max-w-lg mx-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
