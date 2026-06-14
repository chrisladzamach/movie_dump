import { env } from '../config/env';
import { CastMember, Genre, TmdbSearchResult } from '../models/types';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

type AuthStrategy = { mode: 'bearer' | 'api_key'; value: string; label: string };

function buildAuthStrategies(): AuthStrategy[] {
  const strategies: AuthStrategy[] = [];
  const { accessToken, apiKey } = env.tmdb;

  if (accessToken) {
    strategies.push({ mode: 'bearer', value: accessToken, label: 'TMDB_ACCESS_TOKEN' });
  }

  if (apiKey) {
    strategies.push({ mode: 'api_key', value: apiKey, label: 'TMDB_API_KEY (v3)' });

    if (!accessToken && (apiKey.startsWith('eyJ') || apiKey.length > 40)) {
      strategies.push({ mode: 'bearer', value: apiKey, label: 'TMDB_API_KEY (bearer)' });
    }
  }

  return strategies;
}

async function parseTmdbError(response: Response): Promise<string> {
  const body = (await response.json().catch(() => ({}))) as {
    status_message?: string;
    errors?: string[];
  };
  return body.status_message || body.errors?.[0] || `TMDB error: ${response.status}`;
}

async function tmdbFetchOnce<T>(
  path: string,
  params: Record<string, string>,
  strategy: AuthStrategy
): Promise<{ ok: true; data: T } | { ok: false; status: number; message: string }> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set('language', 'es-ES');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (strategy.mode === 'bearer') {
    headers.Authorization = `Bearer ${strategy.value}`;
  } else {
    url.searchParams.set('api_key', strategy.value);
  }

  const response = await fetch(url.toString(), { headers });

  if (!response.ok) {
    return { ok: false, status: response.status, message: await parseTmdbError(response) };
  }

  return { ok: true, data: (await response.json()) as T };
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const strategies = buildAuthStrategies();

  if (strategies.length === 0) {
    throw new Error('No hay credenciales TMDB configuradas');
  }

  let lastMessage = 'Credenciales TMDB inválidas';

  for (const strategy of strategies) {
    const result = await tmdbFetchOnce<T>(path, params, strategy);
    if (result.ok) return result.data;

    lastMessage = result.message;

    if (result.status === 401 && strategies.length > 1) {
      continue;
    }

    throw new Error(lastMessage);
  }

  throw new Error(
    `${lastMessage}. Verifica TMDB_API_KEY (clave v3) o TMDB_ACCESS_TOKEN (Read Access Token) en Render.`
  );
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
