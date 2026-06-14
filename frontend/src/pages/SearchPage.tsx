import { useEffect, useState, useCallback } from 'react';
import { searchTmdb, getTmdbDetails } from '../services/tmdb.service';
import { getAllMovies } from '../services/movie.service';
import { addToWatchlist } from '../services/watchlist.service';
import { TmdbSearchResult, TmdbMovieDetails, Movie, getPosterUrl } from '../types';
import { MovieRegisterModal } from '../components/MovieRegisterModal';
import { useNotifications } from '../hooks/useNotifications';

type Tab = 'local' | 'tmdb';

export function SearchPage() {
  const [tab, setTab] = useState<Tab>('tmdb');
  const [query, setQuery] = useState('');
  const [localResults, setLocalResults] = useState<Movie[]>([]);
  const [tmdbResults, setTmdbResults] = useState<TmdbSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<TmdbMovieDetails | null>(null);
  const [watchedByFilter, setWatchedByFilter] = useState<'any' | 'me' | 'other' | 'both'>('any');
  const { triggerRefresh } = useNotifications();

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setLocalResults([]);
      setTmdbResults([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (tab === 'local') {
        const results = await getAllMovies({ search: q, watchedBy: watchedByFilter === 'any' ? undefined : watchedByFilter });
        setLocalResults(results);
      } else {
        const results = await searchTmdb(q);
        setTmdbResults(results);
      }
    } catch (err) {
      setError((err as Error).message || 'Error al buscar');
      if (tab === 'local') setLocalResults([]);
      else setTmdbResults([]);
    } finally {
      setLoading(false);
    }
  }, [tab, watchedByFilter]);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 400);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleSelectTmdb = async (result: TmdbSearchResult) => {
    try {
      const details = await getTmdbDetails(result.id);
      setSelectedMovie(details);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddWatchlist = async (result: TmdbSearchResult) => {
    try {
      const details = await getTmdbDetails(result.id);
      await addToWatchlist({
        tmdbId: details.id,
        title: details.title,
        posterPath: details.poster_path,
        releaseDate: details.release_date,
        genres: details.genres,
        overview: details.overview,
        cast: details.cast,
      });
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLocal = localResults;

  return (
    <div className="p-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Buscar</h1>
      </header>

      <div className="flex bg-card rounded-xl p-1 mb-4">
        <button
          onClick={() => setTab('tmdb')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'tmdb' ? 'bg-primary text-black' : 'text-muted'
          }`}
        >
          TMDB
        </button>
        <button
          onClick={() => setTab('local')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'local' ? 'bg-primary text-black' : 'text-muted'
          }`}
        >
          Local
        </button>
      </div>

      <input
        type="text"
        placeholder={tab === 'tmdb' ? 'Buscar en TMDB...' : 'Buscar en tu colección...'}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-card border border-white/10 rounded-xl px-4 py-3 text-white mb-4"
      />

      {tab === 'local' && (
        <select
          value={watchedByFilter}
          onChange={(e) => setWatchedByFilter(e.target.value as typeof watchedByFilter)}
          className="w-full bg-card border border-white/10 rounded-lg px-3 py-2 text-sm text-white mb-4"
        >
          <option value="any">Vistas por cualquiera</option>
          <option value="me">Vistas por mí</option>
          <option value="other">Vistas por el otro</option>
          <option value="both">Vistas por ambos</option>
        </select>
      )}

      {loading && <p className="text-muted text-center py-8">Buscando...</p>}

      {error && (
        <p className="text-accent text-sm text-center py-4 bg-accent/10 rounded-xl border border-accent/20">
          {error}
        </p>
      )}

      {tab === 'tmdb' && !loading && !error && tmdbResults.length === 0 && query.trim() && (
        <p className="text-muted text-center py-8">No se encontraron películas</p>
      )}

      {tab === 'tmdb' && !loading && (
        <div className="space-y-3">
          {tmdbResults.map((result) => (
            <div
              key={result.id}
              className="flex gap-3 bg-card rounded-xl p-3 border border-white/5"
            >
              <img
                src={getPosterUrl(result.poster_path)}
                alt={result.title}
                className="w-14 h-20 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm line-clamp-1">{result.title}</h3>
                <p className="text-xs text-muted">{result.release_date?.split('-')[0]}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleSelectTmdb(result)}
                    className="text-xs bg-primary text-black px-3 py-1.5 rounded-lg font-semibold"
                  >
                    Registrar
                  </button>
                  <button
                    onClick={() => handleAddWatchlist(result)}
                    className="text-xs bg-white/10 text-white px-3 py-1.5 rounded-lg"
                  >
                    Watchlist
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'local' && !loading && (
        <div className="space-y-3">
          {filteredLocal.map((movie) => (
            <div
              key={movie.id}
              className="flex gap-3 bg-card rounded-xl p-3 border border-white/5"
            >
              <img
                src={getPosterUrl(movie.poster_path)}
                alt={movie.title}
                className="w-14 h-20 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm">{movie.title}</h3>
                <p className="text-xs text-muted">
                  Vista por: {movie.watched_by === 'yo' ? 'Yo' : movie.watched_by === 'ambos' ? 'Ambos' : movie.watched_by}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMovie && (
        <MovieRegisterModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onSuccess={triggerRefresh}
        />
      )}
    </div>
  );
}
