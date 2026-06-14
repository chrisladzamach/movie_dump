import { MovieFilters } from '../types';

interface FilterBarProps {
  filters: MovieFilters;
  onChange: (filters: MovieFilters) => void;
  genres: string[];
}

export function FilterBar({ filters, onChange, genres }: FilterBarProps) {
  const update = (key: keyof MovieFilters, value: string | boolean | number | undefined) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-3 pb-2">
      <input
        type="text"
        placeholder="Buscar por título..."
        value={filters.search || ''}
        onChange={(e) => update('search', e.target.value)}
        className="w-full bg-card border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white"
      />

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <select
          value={filters.genre || ''}
          onChange={(e) => update('genre', e.target.value || undefined)}
          className="bg-card border border-white/10 rounded-lg px-3 py-2 text-xs text-white flex-shrink-0"
        >
          <option value="">Género</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <select
          value={filters.favorite === undefined ? '' : String(filters.favorite)}
          onChange={(e) =>
            update('favorite', e.target.value === '' ? undefined : e.target.value === 'true')
          }
          className="bg-card border border-white/10 rounded-lg px-3 py-2 text-xs text-white flex-shrink-0"
        >
          <option value="">Favoritas</option>
          <option value="true">Sí</option>
          <option value="false">No</option>
        </select>

        <select
          value={filters.watchedBy || 'any'}
          onChange={(e) => update('watchedBy', e.target.value as MovieFilters['watchedBy'])}
          className="bg-card border border-white/10 rounded-lg px-3 py-2 text-xs text-white flex-shrink-0"
        >
          <option value="any">Vistas por</option>
          <option value="me">Yo</option>
          <option value="other">Otro usuario</option>
          <option value="both">Ambos</option>
        </select>

        <select
          value={filters.minRating || ''}
          onChange={(e) => update('minRating', e.target.value ? Number(e.target.value) : undefined)}
          className="bg-card border border-white/10 rounded-lg px-3 py-2 text-xs text-white flex-shrink-0"
        >
          <option value="">Min ★</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}+
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <input
          type="date"
          value={filters.watchedFrom || ''}
          onChange={(e) => update('watchedFrom', e.target.value || undefined)}
          className="flex-1 bg-card border border-white/10 rounded-lg px-2 py-2 text-xs text-white"
          placeholder="Desde"
        />
        <input
          type="date"
          value={filters.watchedTo || ''}
          onChange={(e) => update('watchedTo', e.target.value || undefined)}
          className="flex-1 bg-card border border-white/10 rounded-lg px-2 py-2 text-xs text-white"
          placeholder="Hasta"
        />
      </div>
    </div>
  );
}
