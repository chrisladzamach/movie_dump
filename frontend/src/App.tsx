import { AuthProvider } from './hooks/useAuth';
import { NotificationProvider } from './hooks/useNotifications';
import { AppRoutes } from './routes/AppRoutes';
import { DesktopBlocker } from './components/DesktopBlocker';
import { isMobileDevice } from './utils/mobile';

function App() {
  if (!isMobileDevice()) {
    return <DesktopBlocker />;
  }

  return (
    <AuthProvider>
      <NotificationProvider>
        <AppRoutes />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
