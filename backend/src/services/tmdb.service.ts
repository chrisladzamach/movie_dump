import { env } from '../config/env';
import { CastMember, Genre, TmdbSearchResult } from '../models/types';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set('api_key', env.tmdbApiKey);
  url.searchParams.set('language', 'es-ES');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TMDB error: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function getPosterUrl(posterPath: string | null): string | null {
  if (!posterPath) return null;
  return `${TMDB_IMAGE_BASE}${posterPath}`;
}

export class TmdbService {
  async searchMovies(query: string): Promise<TmdbSearchResult[]> {
    const data = await tmdbFetch<{ results: TmdbSearchResult[] }>('/search/movie', { query });
    return data.results.slice(0, 20);
  }

  async getMovieDetails(tmdbId: number): Promise<{
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string;
    overview: string;
    genres: Genre[];
    cast: CastMember[];
  }> {
    const [movie, credits] = await Promise.all([
      tmdbFetch<{
        id: number;
        title: string;
        poster_path: string | null;
        release_date: string;
        overview: string;
        genres: Genre[];
      }>(`/movie/${tmdbId}`),
      tmdbFetch<{ cast: Array<{ id: number; name: string; character: string; profile_path: string | null }> }>(
        `/movie/${tmdbId}/credits`
      ),
    ]);

    return {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      overview: movie.overview,
      genres: movie.genres,
      cast: credits.cast.slice(0, 10).map((c) => ({
        id: c.id,
        name: c.name,
        character: c.character,
        profile_path: c.profile_path,
      })),
    };
  }
}

export const tmdbService = new TmdbService();
