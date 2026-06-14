import { apiFetch } from './api';
import { WatchlistItem, Genre, CastMember } from '../types';

export async function getWatchlist() {
  return apiFetch<WatchlistItem[]>('/watchlist');
}

export async function addToWatchlist(data: {
  tmdbId: number;
  title: string;
  posterPath?: string | null;
  releaseDate?: string | null;
  genres?: Genre[];
  overview?: string | null;
  cast?: CastMember[];
}) {
  return apiFetch<{ movieId: number }>('/watchlist', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function removeFromWatchlist(movieId: number) {
  return apiFetch<void>(`/watchlist/${movieId}`, { method: 'DELETE' });
}
