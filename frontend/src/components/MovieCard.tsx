import { Link } from 'react-router-dom';
import { formatRating, getPosterUrl, toBoolean } from '../types';

interface MovieCardProps {
  id?: number;
  title: string;
  posterPath?: string | null;
  rating?: number | string;
  watchedBy?: string;
  username?: string;
  watchedAt?: string;
  isFavorite?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export function MovieCard({
  id,
  title,
  posterPath,
  rating,
  watchedBy,
  username,
  watchedAt,
  isFavorite,
  compact,
  onClick,
}: MovieCardProps) {
  const content = (
    <div
      className={`relative flex-shrink-0 ${compact ? 'w-28' : 'w-36'} group`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <div className="aspect-[2/3] rounded-lg overflow-hidden bg-card shadow-lg">
        <img
          src={getPosterUrl(posterPath)}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {toBoolean(isFavorite) && (
          <span className="absolute top-1 right-1 text-accent text-sm">❤️</span>
        )}
        {rating != null && rating !== '' && (
          <span className="absolute bottom-1 left-1 bg-black/80 text-primary text-xs font-bold px-1.5 py-0.5 rounded">
            ★ {formatRating(rating)}
          </span>
        )}
      </div>
      <h3 className="text-xs font-medium mt-1.5 line-clamp-2 text-white">{title}</h3>
      {(watchedBy || username) && (
        <p className="text-[10px] text-muted mt-0.5">
          {username ? `@${username}` : watchedBy}
          {watchedAt && ` · ${watchedAt}`}
        </p>
      )}
    </div>
  );

  if (onClick || !id) return content;

  return <Link to={`/movies/${id}`}>{content}</Link>;
}
