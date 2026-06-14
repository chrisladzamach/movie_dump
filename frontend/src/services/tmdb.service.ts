import { apiFetch } from './api';
import { TmdbSearchResult, TmdbMovieDetails } from '../types';

export async function searchTmdb(query: string) {
  return apiFetch<TmdbSearchResult[]>(`/tmdb/search?q=${encodeURIComponent(query)}`);
}

export async function getTmdbDetails(tmdbId: number) {
  return apiFetch<TmdbMovieDetails>(`/tmdb/${tmdbId}`);
}
