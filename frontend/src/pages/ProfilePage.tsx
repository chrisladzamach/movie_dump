import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

export function ProfilePage() {
  const { user, otherUsers, logout } = useAuth();

  return (
    <div className="p-4">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Perfil</h1>
      </header>

      <div className="bg-card rounded-2xl p-6 border border-white/5 mb-6">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-3xl mb-4">
          👤
        </div>
        <h2 className="text-xl font-bold">{user?.username}</h2>
        <p className="text-muted text-sm mt-1">{user?.email}</p>
      </div>

      {otherUsers.length > 0 && (
        <div className="bg-card rounded-2xl p-4 border border-white/5 mb-6">
          <h3 className="text-sm font-semibold text-primary mb-3">Conectado con</h3>
          {otherUsers.map((u) => (
            <div key={u.id} className="flex items-center gap-3 py-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm">{u.username}</span>
            </div>
          ))}
        </div>
      )}

      <Link
        to="/movies"
        className="block w-full bg-white/5 text-white text-center py-3 rounded-xl mb-3 border border-white/10"
      >
        Ver todas las películas
      </Link>

      <button
        onClick={logout}
        className="w-full bg-accent/20 text-accent py-3 rounded-xl font-medium border border-accent/30"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
