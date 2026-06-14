import { useEffect, useState } from 'react';
import { TmdbMovieDetails, RegisterMoviePayload, calculateOverall, todayISO, getPosterUrl } from '../types';
import { RatingInput } from './RatingInput';
import { registerMovie } from '../services/movie.service';
import { checkOtherUserView } from '../services/movie.service';
import { useAuth } from '../hooks/useAuth';

interface MovieRegisterModalProps {
  movie: TmdbMovieDetails;
  onClose: () => void;
  onSuccess: () => void;
  initialView?: {
    watchedAt?: string;
    photographyRating?: number;
    soundtrackRating?: number;
    screenplayRating?: number;
    castRating?: number;
    observation?: string;
    isFavorite?: boolean;
  };
}

export function MovieRegisterModal({ movie, onClose, onSuccess, initialView }: MovieRegisterModalProps) {
  const { otherUsers } = useAuth();
  const [watchedAt, setWatchedAt] = useState(initialView?.watchedAt || todayISO());
  const [photography, setPhotography] = useState(initialView?.photographyRating ?? 3);
  const [soundtrack, setSoundtrack] = useState(initialView?.soundtrackRating ?? 3);
  const [screenplay, setScreenplay] = useState(initialView?.screenplayRating ?? 3);
  const [cast, setCast] = useState(initialView?.castRating ?? 3);
  const [observation, setObservation] = useState(initialView?.observation || '');
  const [isFavorite, setIsFavorite] = useState(initialView?.isFavorite ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otherViewInfo, setOtherViewInfo] = useState<{
    otherView: { username?: string; overall_rating: number; watched_at: string } | null;
    watchedBy?: string;
  } | null>(null);

  const overall = calculateOverall(photography, soundtrack, screenplay, cast);

  useEffect(() => {
    checkOtherUserView(movie.id)
      .then((result) =>
        setOtherViewInfo({
          otherView: result.otherView ?? null,
          watchedBy: result.watchedBy,
        })
      )
      .catch(() => undefined);
  }, [movie.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload: RegisterMoviePayload = {
      tmdbId: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      releaseDate: movie.release_date,
      genres: movie.genres,
      overview: movie.overview,
      cast: movie.cast,
      watchedAt,
      photographyRating: photography,
      soundtrackRating: soundtrack,
      screenplayRating: screenplay,
      castRating: cast,
      observation,
      isFavorite,
    };

    try {
      await registerMovie(payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 flex items-end">
      <div className="bg-surface w-full max-h-[92dvh] rounded-t-2xl overflow-y-auto safe-bottom">
        <div className="sticky top-0 bg-surface/95 backdrop-blur border-b border-white/10 p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">Registrar película</h2>
          <button onClick={onClose} className="text-muted text-2xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="flex gap-4">
            <img
              src={getPosterUrl(movie.poster_path)}
              alt={movie.title}
              className="w-24 h-36 object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white">{movie.title}</h3>
              <p className="text-xs text-muted mt-1">{movie.release_date?.split('-')[0]}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {movie.genres?.map((g) => (
                  <span key={g.id} className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">
                    {g.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {otherViewInfo?.otherView && (
            <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-3 text-sm">
              <span className="text-secondary font-medium">
                {otherViewInfo.otherView.username || otherUsers[0]?.username} ya la vio
              </span>
              <span className="text-muted">
                {' '}
                · ★ {otherViewInfo.otherView.overall_rating} · {otherViewInfo.otherView.watched_at}
              </span>
            </div>
          )}

          <div>
            <label className="text-sm text-gray-300 block mb-1">Fecha vista</label>
            <input
              type="date"
              value={watchedAt}
              max={todayISO()}
              onChange={(e) => setWatchedAt(e.target.value)}
              className="w-full bg-card border border-white/10 rounded-lg px-3 py-2.5 text-white"
              required
            />
          </div>

          <div className="bg-card rounded-xl p-3 space-y-1">
            <RatingInput label="Fotografía" value={photography} onChange={setPhotography} />
            <RatingInput label="Banda sonora" value={soundtrack} onChange={setSoundtrack} />
            <RatingInput label="Guión" value={screenplay} onChange={setScreenplay} />
            <RatingInput label="Reparto" value={cast} onChange={setCast} />
            <div className="flex justify-between pt-2 border-t border-white/10">
              <span className="text-sm font-medium text-primary">Valoración general</span>
              <span className="text-lg font-bold text-primary">★ {overall.toFixed(1)}</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-1">Observación</label>
            <textarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              rows={3}
              className="w-full bg-card border border-white/10 rounded-lg px-3 py-2.5 text-white resize-none"
              placeholder="Tus impresiones..."
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              className="w-5 h-5 accent-primary"
            />
            <span className="text-sm">Marcar como favorita ❤️</span>
          </label>

          {error && <p className="text-accent text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-black font-bold py-3.5 rounded-xl disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar registro'}
          </button>
        </form>
      </div>
    </div>
  );
}
