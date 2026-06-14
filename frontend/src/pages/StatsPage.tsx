import { useEffect, useState } from 'react';
import { getStats } from '../services/stats.service';
import { StatsOverview, getPosterUrl } from '../types';
import { useNotifications } from '../hooks/useNotifications';

export function StatsPage() {
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const { refreshKey } = useNotifications();

  useEffect(() => {
    setLoading(true);
    getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) {
    return <div className="text-muted text-center py-12 p-4">Cargando estadísticas...</div>;
  }

  if (!stats) return null;

  const statCards = [
    { label: 'Películas vistas', value: stats.totalWatched, icon: '🎬' },
    { label: 'Promedio valoración', value: `★ ${stats.averageRating.toFixed(1)}`, icon: '⭐' },
    { label: 'Categoría top', value: stats.topGenre || '—', icon: '🎭' },
    { label: 'Favoritas', value: stats.totalFavorites, icon: '❤️' },
  ];

  return (
    <div className="p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Estadísticas</h1>
        <p className="text-muted text-sm">Resumen compartido</p>
      </header>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-card rounded-xl p-4 border border-white/5">
            <span className="text-2xl">{card.icon}</span>
            <p className="text-2xl font-bold mt-2 text-primary">{card.value}</p>
            <p className="text-xs text-muted mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
        Top 10 mejor valoradas
      </h2>

      <div className="space-y-3">
        {stats.topRatedMovies.map((movie, index) => (
          <div
            key={movie.id}
            className="flex items-center gap-3 bg-card rounded-xl p-3 border border-white/5"
          >
            <span className="text-lg font-bold text-muted w-6">{index + 1}</span>
            <img
              src={getPosterUrl(movie.poster_path)}
              alt={movie.title}
              className="w-10 h-14 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-1">{movie.title}</p>
            </div>
            <span className="text-primary font-bold text-sm">★ {movie.overall_rating.toFixed(1)}</span>
          </div>
        ))}
        {stats.topRatedMovies.length === 0 && (
          <p className="text-muted text-center py-4">Sin datos aún</p>
        )}
      </div>
    </div>
  );
}
