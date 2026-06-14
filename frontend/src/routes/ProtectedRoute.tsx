import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="text-primary animate-pulse text-lg">Cargando...</div>
      </div>
    );
  }

  if (!token) return <Navigate to="/login" replace />;

  return <Outlet />;
}

export function GuestRoute() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="text-primary animate-pulse text-lg">Cargando...</div>
      </div>
    );
  }

  if (token) return <Navigate to="/" replace />;

  return <Outlet />;
}
