import { useEffect, useMemo, useState } from 'react';
import { getAllMovies } from '../services/movie.service';
import { Movie, MovieFilters } from '../types';
import { MovieCard } from '../components/MovieCard';
import { FilterBar } from '../components/FilterBar';
import { useNotifications } from '../hooks/useNotifications';

export function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filters, setFilters] = useState<MovieFilters>({});
  const [loading, setLoading] = useState(true);
  const { refreshKey } = useNotifications();

  const genres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => m.genres?.forEach((g) => set.add(g.name)));
    return Array.from(set).sort();
  }, [movies]);

  useEffect(() => {
    setLoading(true);
    getAllMovies(filters)
      .then(setMovies)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters, refreshKey]);

  return (
    <div className="p-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Películas</h1>
        <p className="text-muted text-sm">{movies.length} registros</p>
      </header>

      <FilterBar filters={filters} onChange={setFilters} genres={genres} />

      {loading ? (
        <div className="text-muted text-center py-12">Cargando...</div>
      ) : movies.length === 0 ? (
        <div className="text-muted text-center py-12">No hay películas con estos filtros</div>
      ) : (
        <div className="grid grid-cols-3 gap-3 mt-4">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              id={movie.id}
              title={movie.title}
              posterPath={movie.poster_path}
              rating={movie.avg_rating ?? movie.my_view?.overall_rating}
              watchedBy={
                movie.watched_by === 'yo'
                  ? 'Yo'
                  : movie.watched_by === 'ambos'
                    ? 'Ambos'
                    : movie.watched_by
              }
              isFavorite={movie.my_view?.is_favorite}
              compact
            />
          ))}
        </div>
      )}
    </div>
  );
}
