import { useEffect, useState } from 'react';
import { getMovieById } from '../services/movie.service';
import { getComments, addComment } from '../services/comment.service';
import { getTmdbDetails } from '../services/tmdb.service';
import {
  Movie,
  Comment,
  TmdbMovieDetails,
  getPosterUrl,
  formatRating,
  formatDate,
} from '../types';
import { MovieRegisterModal } from './MovieRegisterModal';

interface MovieDetailModalProps {
  movieId: number;
  onClose: () => void;
}

export function MovieDetailModal({ movieId, onClose }: MovieDetailModalProps) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [editModal, setEditModal] = useState<TmdbMovieDetails | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [movieData, commentsData] = await Promise.all([
        getMovieById(movieId),
        getComments(movieId),
      ]);
      setMovie(movieData);
      setComments(commentsData);
    } catch (err) {
      console.error('Error cargando detalle:', err);
      setError(err instanceof Error ? err.message : 'No se pudo cargar la película');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [movieId]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const updated = await addComment(movieId, newComment.trim());
    setComments(updated);
    setNewComment('');
  };

  const handleEdit = async () => {
    if (!movie) return;
    const details = await getTmdbDetails(movie.tmdb_id);
    setEditModal(details);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center">
        <div className="text-muted">Cargando...</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
        <div className="bg-surface rounded-2xl p-6 max-w-sm w-full text-center">
          <p className="text-accent mb-2">Error al cargar</p>
          <p className="text-sm text-gray-300 mb-4">{error || 'No se encontró la película'}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={load}
              className="bg-primary text-black px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Reintentar
            </button>
            <button
              onClick={onClose}
              className="bg-card text-white px-4 py-2 rounded-lg text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const view = movie.my_view;

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
              src={getPosterUrl(movie.poster_path)}
              alt={movie.title}
              className="w-28 h-42 object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-lg">{movie.title}</h3>
              <p className="text-xs text-muted mt-1">
                {movie.release_date?.split('-')[0]} · Vista por:{' '}
                {movie.watched_by === 'yo'
                  ? 'Yo'
                  : movie.watched_by === 'ambos'
                  ? 'Ambos'
                  : movie.watched_by}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {movie.genres?.map((g) => (
                  <span key={g.id} className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">
                    {g.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {view && (
            <div className="bg-card rounded-xl p-4 border border-white/5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-primary font-bold text-xl">★ {formatRating(view.overall_rating)}</span>
                {view.is_favorite && <span>❤️ Favorita</span>}
              </div>
              <p className="text-xs text-muted mb-2">Vista el {formatDate(view.watched_at)}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <span>Fotografía: {view.photography_rating}/5</span>
                <span>Banda sonora: {view.soundtrack_rating}/5</span>
                <span>Guión: {view.screenplay_rating}/5</span>
                <span>Reparto: {view.cast_rating}/5</span>
              </div>
              {view.observation && (
                <p className="text-sm text-gray-300 mt-3 italic">"{view.observation}"</p>
              )}
              <button onClick={handleEdit} className="mt-3 text-xs text-secondary">
                Editar mi registro
              </button>
            </div>
          )}

          {movie.other_view && (
            <div className="bg-secondary/10 rounded-xl p-4 border border-secondary/20">
              <p className="text-sm font-medium text-secondary">
                {movie.other_view.username} · ★ {formatRating(movie.other_view.overall_rating)}
              </p>
              <p className="text-xs text-muted mt-1">Vista el {formatDate(movie.other_view.watched_at)}</p>
              {movie.other_view.observation && (
                <p className="text-sm text-gray-300 mt-2 italic">"{movie.other_view.observation}"</p>
              )}
            </div>
          )}

          {movie.overview && (
            <div>
              <h3 className="text-sm font-semibold text-primary mb-2">Sinopsis</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{movie.overview}</p>
            </div>
          )}

          {movie.cast_data && movie.cast_data.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-primary mb-2">Reparto</h3>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {movie.cast_data.map((c) => (
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

          <div>
            <h3 className="text-sm font-semibold text-primary mb-3">Comentarios</h3>
            <div className="space-y-3 mb-4">
              {comments.map((c) => (
                <div key={c.id} className="bg-card rounded-lg p-3 border border-white/5">
                  <p className="text-xs text-primary font-medium">{c.username}</p>
                  <p className="text-sm text-gray-300 mt-1">{c.content}</p>
                </div>
              ))}
              {comments.length === 0 && <p className="text-muted text-sm">Sin comentarios aún</p>}
            </div>
            <form onSubmit={handleComment} className="flex gap-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="flex-1 bg-card border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              />
              <button
                type="submit"
                className="bg-primary text-black px-4 py-2 rounded-lg text-sm font-semibold"
              >
                Enviar
              </button>
            </form>
          </div>
        </div>
      </div>

      {editModal && view && (
        <MovieRegisterModal
          movie={editModal}
          onClose={() => setEditModal(null)}
          onSuccess={load}
          initialView={{
            watchedAt: view.watched_at,
            photographyRating: view.photography_rating,
            soundtrackRating: view.soundtrack_rating,
            screenplayRating: view.screenplay_rating,
            castRating: view.cast_rating,
            observation: view.observation || '',
            isFavorite: view.is_favorite,
          }}
        />
      )}
    </div>
  );
}
