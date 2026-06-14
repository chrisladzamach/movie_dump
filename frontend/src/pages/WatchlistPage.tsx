import { useEffect, useState } from 'react';
import { getWatchlist } from '../services/watchlist.service';
import { getTmdbDetails } from '../services/tmdb.service';
import { removeFromWatchlist } from '../services/watchlist.service';
import { WatchlistItem, getPosterUrl } from '../types';
import { MovieRegisterModal } from '../components/MovieRegisterModal';
import { useNotifications } from '../hooks/useNotifications';
import { TmdbMovieDetails } from '../types';

export function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<TmdbMovieDetails | null>(null);
  const { refreshKey, triggerRefresh } = useNotifications();

  useEffect(() => {
    setLoading(true);
    getWatchlist()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const handleMarkWatched = async (item: WatchlistItem) => {
    try {
      const details = await getTmdbDetails(item.tmdb_id);
      setSelectedMovie(details);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (movieId: number) => {
    try {
      await removeFromWatchlist(movieId);
      setItems((prev) => prev.filter((i) => i.movie_id !== movieId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Watchlist</h1>
        <p className="text-muted text-sm">{items.length} pendientes</p>
      </header>

      {loading ? (
        <div className="text-muted text-center py-12">Cargando...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted">No hay películas pendientes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 bg-card rounded-xl p-3 border border-white/5"
            >
              <img
                src={getPosterUrl(item.poster_path)}
                alt={item.title}
                className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-xs text-muted mt-1">{item.release_date?.split('-')[0]}</p>
                {item.other_has_view && !item.has_view && (
                  <p className="text-xs text-secondary mt-1">El otro usuario ya la vio</p>
                )}
                {item.has_view && (
                  <p className="text-xs text-primary mt-1">Ya la registraste</p>
                )}
                <div className="flex gap-2 mt-3">
                  {!item.has_view && (
                    <button
                      onClick={() => handleMarkWatched(item)}
                      className="text-xs bg-primary text-black px-3 py-1.5 rounded-lg font-semibold"
                    >
                      Marcar vista
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(item.movie_id)}
                    className="text-xs bg-white/10 text-white px-3 py-1.5 rounded-lg"
                  >
                    Quitar
                  </button>
                </div>
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
