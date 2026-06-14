import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLatestMovies } from '../services/movie.service';
import { LatestMovie } from '../types';
import { MovieCard } from '../components/MovieCard';
import { useNotifications } from '../hooks/useNotifications';

export function HomePage() {
  const [movies, setMovies] = useState<LatestMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshKey } = useNotifications();

  useEffect(() => {
    setLoading(true);
    getLatestMovies(12)
      .then(setMovies)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return (
    <div className="p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">Movie Dump</h1>
        <p className="text-muted text-sm mt-1">Últimas películas vistas</p>
      </header>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">Recientes</h2>
        <Link to="/movies" className="text-xs text-secondary">
          Ver todas →
        </Link>
      </div>

      {loading ? (
        <div className="text-muted text-center py-12">Cargando...</div>
      ) : movies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted mb-4">Aún no hay películas registradas</p>
          <Link
            to="/search"
            className="inline-block bg-primary text-black font-semibold px-6 py-2.5 rounded-xl"
          >
            Buscar y registrar
          </Link>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {movies.map((movie) => (
            <MovieCard
              key={`${movie.movie_id}-${movie.user_id}`}
              id={movie.movie_id}
              title={movie.title}
              posterPath={movie.poster_path}
              rating={movie.overall_rating}
              username={movie.username}
              watchedAt={movie.watched_at}
              isFavorite={movie.is_favorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
