import { Link } from 'react-router-dom';
import { formatRating, formatDate, getPosterUrl, toBoolean } from '../types';

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
  layout?: 'grid' | 'list';
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
  layout = 'grid',
  onClick,
}: MovieCardProps) {
  const favoriteBadge = toBoolean(isFavorite) && (
    <span className="absolute top-1 right-1 text-accent text-sm">❤️</span>
  );

  const titleEl = (
    <h3 className={`font-medium line-clamp-2 text-white ${compact ? 'text-xs mt-1.5' : 'text-sm mt-2'}`}>
      {title}
    </h3>
  );

  const metaEl = (watchedBy || username) && (
    <p className={`text-muted ${compact ? 'text-[10px] mt-0.5' : 'text-xs mt-0.5'}`}>
      {username ? `@${username}` : watchedBy}
      {watchedAt && ` · ${formatDate(watchedAt)}`}
    </p>
  );

  const ratingEl = rating != null && rating !== '' && (
    <span className={`font-bold text-primary ${compact ? 'text-xs' : 'text-sm mt-0.5'}`}>
      ★ {formatRating(rating)}
    </span>
  );

  if (compact) {
    const content = (
      <div
        className="relative flex-shrink-0 w-28 group"
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
          {favoriteBadge}
          {ratingEl && (
            <span className="absolute bottom-1 left-1 bg-black/80 text-primary text-xs font-bold px-1.5 py-0.5 rounded">
              ★ {formatRating(rating)}
            </span>
          )}
        </div>
        {titleEl}
        {metaEl}
      </div>
    );

    if (onClick || !id) return content;
    return <Link to={`/movies/${id}`}>{content}</Link>;
  }

  if (layout === 'list') {
    const content = (
      <div
        className="relative flex gap-3 w-full group"
        onClick={onClick}
        role={onClick ? 'button' : undefined}
      >
        <div className="relative w-20 flex-shrink-0 aspect-[2/3] rounded-lg overflow-hidden bg-card shadow-lg">
          <img
            src={getPosterUrl(posterPath)}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {favoriteBadge}
        </div>
        <div className="flex-1 min-w-0 py-0.5 flex flex-col items-start">
          {titleEl}
          {metaEl}
          {ratingEl}
        </div>
      </div>
    );

    if (onClick || !id) return content;
    return <Link to={`/movies/${id}`}>{content}</Link>;
  }

  const content = (
    <div
      className="relative flex-shrink-0 w-full group"
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
        {favoriteBadge}
      </div>
      {titleEl}
      {metaEl}
      {ratingEl}
    </div>
  );

  if (onClick || !id) return content;

  return <Link to={`/movies/${id}`}>{content}</Link>;
}
