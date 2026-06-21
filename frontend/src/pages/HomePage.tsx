import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLatestMovies } from '../services/movie.service';
import { LatestMovie } from '../types';
import { MovieCard } from '../components/MovieCard';
import { MovieDetailModal } from '../components/MovieDetailModal';
import { useNotifications } from '../hooks/useNotifications';

type ViewMode = 'grid' | 'list';

export function HomePage() {
  const [movies, setMovies] = useState<LatestMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedMovie, setSelectedMovie] = useState<LatestMovie | null>(null);
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'))}
            className="text-xs bg-card border border-white/10 rounded-lg px-2.5 py-1.5 text-white flex items-center gap-1.5"
            aria-label={viewMode === 'grid' ? 'Cambiar a vista lista' : 'Cambiar a vista grid'}
          >
            {viewMode === 'grid' ? (
              <>
                <span>☰</span>
                <span>Lista</span>
              </>
            ) : (
              <>
                <span>⊞</span>
                <span>Grid</span>
              </>
            )}
          </button>
        </div>
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
        <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-3' : 'flex flex-col gap-3'}>
          {movies.map((movie) => (
            <MovieCard
              key={movie.movie_id}
              title={movie.title}
              posterPath={movie.poster_path}
              rating={movie.overall_rating}
              watchedBy={movie.usernames}
              watchedAt={movie.watched_at}
              isFavorite={movie.is_favorite}
              layout={viewMode}
              onClick={() => setSelectedMovie(movie)}
            />
          ))}
        </div>
      )}

      {selectedMovie && (
        <MovieDetailModal initialMovie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  );
}
