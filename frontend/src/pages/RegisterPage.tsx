import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function RegisterPage() {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(username, email, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Crear cuenta</h1>
        <p className="text-muted text-sm">Únete a Movie Dump</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-card border border-white/10 rounded-xl px-4 py-3 text-white"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-card border border-white/10 rounded-xl px-4 py-3 text-white"
          required
        />
        <input
          type="password"
          placeholder="Contraseña (mín. 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          className="w-full bg-card border border-white/10 rounded-xl px-4 py-3 text-white"
          required
        />
        {error && <p className="text-accent text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-black font-bold py-3.5 rounded-xl disabled:opacity-50"
        >
          {loading ? 'Creando...' : 'Registrarse'}
        </button>
      </form>

      <p className="text-center text-sm text-muted mt-6">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-primary">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
