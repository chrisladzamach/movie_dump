import { AuthProvider } from './hooks/useAuth';
import { NotificationProvider } from './hooks/useNotifications';
import { AppRoutes } from './routes/AppRoutes';
import { DesktopBlocker } from './components/DesktopBlocker';
import { ErrorBoundary } from './components/ErrorBoundary';
import { isMobileDevice } from './utils/mobile';

function App() {
  if (!isMobileDevice()) {
    return <DesktopBlocker />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
