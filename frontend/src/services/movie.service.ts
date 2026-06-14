import { apiFetch } from './api';
import {
  Movie,
  LatestMovie,
  RegisterMoviePayload,
  MovieFilters,
} from '../types';

function buildQuery(filters: MovieFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== 'any') {
      params.set(key, String(value));
    }
  });
  const query = params.toString();
  return query ? `?${query}` : '';
}

export async function registerMovie(payload: RegisterMoviePayload) {
  return apiFetch<Movie>('/movies/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getLatestMovies(limit = 10) {
  return apiFetch<LatestMovie[]>(`/movies/latest?limit=${limit}`);
}

export async function getAllMovies(filters: MovieFilters = {}) {
  return apiFetch<Movie[]>(`/movies${buildQuery(filters)}`);
}

export async function getMovieById(id: number) {
  return apiFetch<Movie>(`/movies/${id}`);
}

export async function searchLocalMovies(query: string) {
  return apiFetch<Movie[]>(`/movies/search?q=${encodeURIComponent(query)}`);
}

export async function checkOtherUserView(tmdbId: number) {
  return apiFetch<{
    exists: boolean;
    movieId?: number;
    otherView: Movie['other_view'];
    myView: Movie['my_view'];
    watchedBy?: string;
  }>(`/movies/check/${tmdbId}`);
}
