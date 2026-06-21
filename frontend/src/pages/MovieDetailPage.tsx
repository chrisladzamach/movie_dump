import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieById } from '../services/movie.service';
import { getComments, addComment } from '../services/comment.service';
import { getTmdbDetails } from '../services/tmdb.service';
import { Movie, Comment, getPosterUrl, TmdbMovieDetails, formatRating, formatDate } from '../types';
import { MovieRegisterModal } from '../components/MovieRegisterModal';

export function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editModal, setEditModal] = useState<TmdbMovieDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id) return;
    try {
      const [movieData, commentsData] = await Promise.all([
        getMovieById(Number(id)),
        getComments(Number(id)),
      ]);
      setMovie(movieData);
      setComments(commentsData);
    } catch {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newComment.trim()) return;
    const updated = await addComment(Number(id), newComment.trim());
    setComments(updated);
    setNewComment('');
  };

  const handleEdit = async () => {
    if (!movie) return;
    const details = await getTmdbDetails(movie.tmdb_id);
    setEditModal(details);
  };

  if (loading || !movie) {
    return <div className="text-muted text-center py-12">Cargando...</div>;
  }

  const view = movie.my_view;

  return (
    <div className="pb-8">
      <div className="relative">
        <img
          src={getPosterUrl(movie.poster_path)}
          alt={movie.title}
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center"
        >
          ←
        </button>
      </div>

      <div className="p-4 -mt-16 relative">
        <h1 className="text-2xl font-bold">{movie.title}</h1>
        <p className="text-muted text-sm mt-1">
          {movie.release_date?.split('-')[0]} · Vista por:{' '}
          {movie.watched_by === 'yo' ? 'Yo' : movie.watched_by === 'ambos' ? 'Ambos' : movie.watched_by}
        </p>

        <div className="flex flex-wrap gap-1 mt-3">
          {movie.genres?.map((g) => (
            <span key={g.id} className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
              {g.name}
            </span>
          ))}
        </div>

        {view && (
          <div className="bg-card rounded-xl p-4 mt-4 border border-white/5">
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
            <button
              onClick={handleEdit}
              className="mt-3 text-xs text-secondary"
            >
              Editar mi registro
            </button>
          </div>
        )}

        {movie.other_view && (
          <div className="bg-secondary/10 rounded-xl p-4 mt-3 border border-secondary/20">
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
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-primary mb-2">Sinopsis</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{movie.overview}</p>
          </div>
        )}

        {movie.cast_data && movie.cast_data.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-primary mb-2">Reparto</h3>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {movie.cast_data.map((c) => (
                <div key={c.id} className="flex-shrink-0 w-20 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-card overflow-hidden">
                    {c.profile_path ? (
                      <img src={getPosterUrl(c.profile_path)} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                    )}
                  </div>
                  <p className="text-[10px] mt-1 line-clamp-1">{c.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-primary mb-3">Comentarios</h3>
          <div className="space-y-3 mb-4">
            {comments.map((c) => (
              <div key={c.id} className="bg-card rounded-lg p-3 border border-white/5">
                <p className="text-xs text-primary font-medium">{c.username}</p>
                <p className="text-sm text-gray-300 mt-1">{c.content}</p>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-muted text-sm">Sin comentarios aún</p>
            )}
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
