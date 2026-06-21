export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface MovieView {
  id: number;
  movie_id: number;
  user_id: number;
  watched_at: string;
  photography_rating: number;
  soundtrack_rating: number;
  screenplay_rating: number;
  cast_rating: number;
  overall_rating: number;
  observation: string | null;
  is_favorite: boolean;
  username?: string;
}

export interface Movie {
  id: number;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  genres: Genre[] | null;
  overview: string | null;
  cast_data: CastMember[] | null;
  views?: MovieView[];
  watched_by?: string;
  my_view?: MovieView;
  other_view?: MovieView;
  avg_rating?: number;
}

export interface LatestMovie extends MovieView {
  title: string;
  poster_path: string | null;
  tmdb_id: number;
}

export interface TmdbSearchResult {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
  genre_ids: number[];
}

export interface TmdbMovieDetails {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
  genres: Genre[];
  cast: CastMember[];
}

export interface WatchlistItem {
  id: number;
  movie_id: number;
  user_id: number;
  added_at: string;
  title: string;
  poster_path: string | null;
  tmdb_id: number;
  release_date: string | null;
  has_view: boolean;
  other_has_view: boolean;
}

export interface StatsOverview {
  totalWatched: number;
  averageRating: number;
  topGenre: string | null;
  totalFavorites: number;
  topRatedMovies: Array<{
    id: number;
    title: string;
    poster_path: string | null;
    overall_rating: number;
  }>;
}

export interface Comment {
  id: number;
  movie_id: number;
  user_id: number;
  content: string;
  created_at: string;
  username: string;
}

export interface NotificationEvent {
  type: string;
  movieId?: number;
  movieTitle?: string;
  username?: string;
  content?: string;
  timestamp?: string;
  excludeUserId?: number;
}

export interface RegisterMoviePayload {
  tmdbId: number;
  title: string;
  posterPath?: string | null;
  releaseDate?: string | null;
  genres?: Genre[];
  overview?: string | null;
  cast?: CastMember[];
  watchedAt: string;
  photographyRating: number;
  soundtrackRating: number;
  screenplayRating: number;
  castRating: number;
  observation?: string;
  isFavorite?: boolean;
}

export interface MovieFilters {
  search?: string;
  genre?: string;
  favorite?: boolean;
  minRating?: number;
  maxRating?: number;
  releaseYear?: number;
  watchedFrom?: string;
  watchedTo?: string;
  watchedBy?: 'me' | 'other' | 'both' | 'any';
}

export const TMDB_POSTER_BASE = 'https://image.tmdb.org/t/p/w500';

export function getPosterUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder-poster.svg';
  if (path.startsWith('http')) return path;
  return `${TMDB_POSTER_BASE}${path}`;
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '';
  const isoDate = value.split('T')[0];
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

export function calculateOverall(
  photography: number,
  soundtrack: number,
  screenplay: number,
  cast: number
): number {
  return Math.round(((photography + soundtrack + screenplay + cast) / 4) * 100) / 100;
}

export function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function formatRating(value: unknown, digits = 1): string {
  return toNumber(value).toFixed(digits);
}

export function toBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === '1';
}
