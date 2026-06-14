export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
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
  created_at: Date;
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
  created_at: Date;
  updated_at: Date;
}

export interface WatchlistItem {
  id: number;
  movie_id: number;
  user_id: number;
  added_at: Date;
}

export interface Comment {
  id: number;
  movie_id: number;
  user_id: number;
  content: string;
  created_at: Date;
}

export interface MovieWithViews extends Movie {
  views: MovieViewWithUser[];
  watched_by: 'yo' | 'ambos' | string;
  my_view?: MovieView;
  other_view?: MovieViewWithUser;
}

export interface MovieViewWithUser extends MovieView {
  username: string;
}

export interface JwtPayload {
  userId: number;
  username: string;
}

export interface MovieFilters {
  genre?: string;
  favorite?: boolean;
  minRating?: number;
  maxRating?: number;
  releaseYear?: number;
  watchedFrom?: string;
  watchedTo?: string;
  watchedBy?: 'me' | 'other' | 'both' | 'any';
  search?: string;
}

export interface RegisterMovieInput {
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

export interface TmdbSearchResult {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
  genre_ids: number[];
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

export type NotificationEvent =
  | { type: 'movie_registered'; movieId: number; movieTitle: string; username: string }
  | { type: 'movie_updated'; movieId: number; movieTitle: string; username: string }
  | { type: 'comment_added'; movieId: number; movieTitle: string; username: string; content: string }
  | { type: 'watchlist_added'; movieId: number; movieTitle: string; username: string }
  | { type: 'watchlist_watched'; movieId: number; movieTitle: string; username: string };
