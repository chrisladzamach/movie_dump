import { useEffect, useState } from 'react';
import { getMovieById } from '../services/movie.service';
import { getComments } from '../services/comment.service';
import { getTmdbDetails } from '../services/tmdb.service';
import {
  Movie,
  MovieView,
  Comment,
  LatestMovie,
  TmdbMovieDetails,
  getPosterUrl,
  formatRating,
  formatDate,
} from '../types';
import { MovieRegisterModal } from './MovieRegisterModal';
import { useAuth } from '../hooks/useAuth';

interface MovieDetailModalProps {
  initialMovie: LatestMovie;
  onClose: () => void;
}

export function MovieDetailModal({ initialMovie, onClose }: MovieDetailModalProps) {
  const { user } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [tmdbDetails, setTmdbDetails] = useState<TmdbMovieDetails | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingMovie, setLoadingMovie] = useState(true);
  const [loadingTmdb, setLoadingTmdb] = useState(true);
  const [editModal, setEditModal] = useState<TmdbMovieDetails | null>(null);
  const [expandedView, setExpandedView] = useState<string | null>(null);

  const loadDetails = async () => {
    setLoadingTmdb(true);
    try {
      const details = await getTmdbDetails(initialMovie.tmdb_id);
      setTmdbDetails(details);
    } catch (err) {
      console.error('Error cargando detalles TMDB:', err);
    } finally {
      setLoadingTmdb(false);
    }
  };

  const loadBackendData = async () => {
    setLoadingMovie(true);
    try {
      const [movieData, commentsData] = await Promise.all([
        getMovieById(initialMovie.movie_id),
        getComments(initialMovie.movie_id),
      ]);
      setMovie(movieData);
      setComments(commentsData);
    } catch (err) {
      console.error('Error cargando datos del backend:', err);
    } finally {
      setLoadingMovie(false);
    }
  };

  useEffect(() => {
    loadDetails();
    loadBackendData();
  }, [initialMovie.movie_id, initialMovie.tmdb_id]);

  const handleEdit = async () => {
    const details = tmdbDetails || (await getTmdbDetails(initialMovie.tmdb_id).catch(() => null));
    if (!details) return;
    setEditModal(details);
  };

  const title = tmdbDetails?.title || initialMovie.title;
  const posterPath = tmdbDetails?.poster_path || initialMovie.poster_path;
  const releaseYear = tmdbDetails?.release_date?.split('-')[0];
  const genres = tmdbDetails?.genres || [];
  const cast = tmdbDetails?.cast || [];
  const overview = tmdbDetails?.overview;

  const views = movie?.views?.length ? movie.views : initialMovie.user_id ? ([initialMovie] as MovieView[]) : [];
  const myView = views.find((v) => v.user_id === user?.id);
  const watchedByLabel = initialMovie.usernames || movie?.watched_by || initialMovie.username || '';
  const canEdit = Boolean(myView) && myView?.user_id === user?.id;

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 flex items-end">
      <div className="bg-surface w-full max-h-[92dvh] rounded-t-2xl overflow-y-auto safe-bottom">
        <div className="sticky top-0 bg-surface/95 backdrop-blur border-b border-white/10 p-4 flex justify-between items-center z-10">
          <h2 className="text-lg font-bold">Detalle</h2>
          <button onClick={onClose} className="text-muted text-2xl leading-none">
            ×
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex gap-4">
            <img
              src={getPosterUrl(posterPath)}
              alt={title}
              className="w-28 h-42 object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-lg">{title}</h3>
              <p className="text-xs text-muted mt-1">
                {releaseYear ? `${releaseYear} · ` : ''}
                Vista por: {watchedByLabel}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {genres.map((g) => (
                  <span key={g.id} className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">
                    {g.name}
                  </span>
                ))}
              </div>
              {loadingTmdb && <p className="text-[10px] text-muted mt-2">Cargando detalles...</p>}
            </div>
          </div>

          {loadingMovie && views.length === 0 && (
            <p className="text-sm text-muted text-center py-4">Cargando registros...</p>
          )}

          {views.map((view) => {
            const isMine = view.user_id === user?.id;
            const expanded = expandedView === String(view.user_id);
            return (
              <div
                key={view.user_id}
                className={`rounded-xl p-4 cursor-pointer ${
                  isMine
                    ? 'bg-card border border-white/5'
                    : 'bg-secondary/10 border border-secondary/20'
                }`}
                onClick={() => setExpandedView((prev) => (prev === String(view.user_id) ? null : String(view.user_id)))}
                role="button"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className={`text-sm font-medium ${isMine ? 'text-white' : 'text-secondary'}`}>
                      ★ {formatRating(view.overall_rating)} · {view.username || initialMovie.username}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      Vista el {formatDate(view.watched_at)}
                      {view.is_favorite && ' · ❤️ Favorita'}
                    </p>
                  </div>
                  <span className="text-muted text-xs">{expanded ? '▲' : '▼'}</span>
                </div>
                {expanded && (
                  <div className={`mt-3 pt-3 border-t ${isMine ? 'border-white/10' : 'border-secondary/20'}`}>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <span>Fotografía: {view.photography_rating}/5</span>
                      <span>Banda sonora: {view.soundtrack_rating}/5</span>
                      <span>Guión: {view.screenplay_rating}/5</span>
                      <span>Reparto: {view.cast_rating}/5</span>
                    </div>
                    {view.observation && (
                      <p className="text-sm text-gray-300 mt-3 italic">"{view.observation}"</p>
                    )}
                    {isMine && canEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit();
                        }}
                        className="mt-3 text-xs text-secondary"
                      >
                        Editar mi registro
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {overview && (
            <div>
              <h3 className="text-sm font-semibold text-primary mb-2">Sinopsis</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{overview}</p>
            </div>
          )}

          {cast.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-primary mb-2">Reparto</h3>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {cast.map((c) => (
                  <div key={c.id} className="flex-shrink-0 w-20 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-card overflow-hidden">
                      {c.profile_path ? (
                        <img
                          src={getPosterUrl(c.profile_path)}
                          alt={c.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                      )}
                    </div>
                    <p className="text-[10px] mt-1 line-clamp-1">{c.name}</p>
                    <p className="text-[9px] text-muted line-clamp-1">{c.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loadingMovie && comments.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-primary mb-3">Comentarios</h3>
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="bg-card rounded-lg p-3 border border-white/5">
                    <p className="text-xs text-primary font-medium">{c.username}</p>
                    <p className="text-sm text-gray-300 mt-1">{c.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {editModal && myView && (
        <MovieRegisterModal
          movie={editModal}
          onClose={() => setEditModal(null)}
          onSuccess={loadBackendData}
          initialView={{
            watchedAt: myView.watched_at,
            photographyRating: myView.photography_rating,
            soundtrackRating: myView.soundtrack_rating,
            screenplayRating: myView.screenplay_rating,
            castRating: myView.cast_rating,
            observation: ('observation' in myView ? myView.observation : '') || '',
            isFavorite: myView.is_favorite,
          }}
        />
      )}
    </div>
  );
}
