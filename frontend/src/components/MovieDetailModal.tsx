import { useEffect, useState } from 'react';
import { getMovieById } from '../services/movie.service';
import { getComments } from '../services/comment.service';
import { getTmdbDetails } from '../services/tmdb.service';
import {
  Movie,
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
  const [error, setError] = useState<string | null>(null);
  const [editModal, setEditModal] = useState<TmdbMovieDetails | null>(null);
  const [expandedView, setExpandedView] = useState<'mine' | 'other' | null>(null);

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
    setError(null);
    try {
      const [movieData, commentsData] = await Promise.all([
        getMovieById(initialMovie.movie_id),
        getComments(initialMovie.movie_id),
      ]);
      setMovie(movieData);
      setComments(commentsData);
    } catch (err) {
      console.error('Error cargando datos del backend:', err);
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los datos completos');
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

  const isMyInitialView = user?.id === initialMovie.user_id;
  const myView = movie?.my_view || (isMyInitialView ? initialMovie : null);
  const otherView = movie?.other_view || (!isMyInitialView ? initialMovie : null);
  const watchedBy = movie?.watched_by;
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
                Vista por:{' '}
                {watchedBy === 'yo'
                  ? 'Yo'
                  : watchedBy === 'ambos'
                  ? 'Ambos'
                  : watchedBy || `@${initialMovie.username}`}
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

          {myView && (
            <div
              className="bg-card rounded-xl p-4 border border-white/5 cursor-pointer"
              onClick={() => setExpandedView((prev) => (prev === 'mine' ? null : 'mine'))}
              role="button"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-white">
                    ★ {formatRating(myView.overall_rating)} · @{myView.username || initialMovie.username}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    Vista el {formatDate(myView.watched_at)}
                    {myView.is_favorite && ' · ❤️ Favorita'}
                  </p>
                </div>
                <span className="text-muted text-xs">{expandedView === 'mine' ? '▲' : '▼'}</span>
              </div>
              {expandedView === 'mine' && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span>Fotografía: {myView.photography_rating}/5</span>
                    <span>Banda sonora: {myView.soundtrack_rating}/5</span>
                    <span>Guión: {myView.screenplay_rating}/5</span>
                    <span>Reparto: {myView.cast_rating}/5</span>
                  </div>
                  {'observation' in myView && myView.observation && (
                    <p className="text-sm text-gray-300 mt-3 italic">"{myView.observation}"</p>
                  )}
                  {canEdit && (
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
          )}

          {otherView && (
            <div
              className="bg-secondary/10 rounded-xl p-4 border border-secondary/20 cursor-pointer"
              onClick={() => setExpandedView((prev) => (prev === 'other' ? null : 'other'))}
              role="button"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-secondary">
                    ★ {formatRating(otherView.overall_rating)} · @{otherView.username}
                  </p>
                  <p className="text-xs text-muted mt-0.5">Vista el {formatDate(otherView.watched_at)}</p>
                </div>
                <span className="text-muted text-xs">{expandedView === 'other' ? '▲' : '▼'}</span>
              </div>
              {expandedView === 'other' && (
                <div className="mt-3 pt-3 border-t border-secondary/20">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span>Fotografía: {otherView.photography_rating}/5</span>
                    <span>Banda sonora: {otherView.soundtrack_rating}/5</span>
                    <span>Guión: {otherView.screenplay_rating}/5</span>
                    <span>Reparto: {otherView.cast_rating}/5</span>
                  </div>
                  {'observation' in otherView && otherView.observation && (
                    <p className="text-sm text-gray-300 mt-3 italic">"{otherView.observation}"</p>
                  )}
                </div>
              )}
            </div>
          )}

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

          {error && (
            <p className="text-xs text-accent">
              Datos complementarios no disponibles: {error}
            </p>
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
