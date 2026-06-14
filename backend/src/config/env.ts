import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string): string {
  const value = cleanEnv(process.env[key]);
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function cleanEnv(value?: string): string | undefined {
  if (!value) return undefined;
  return value.trim().replace(/^["']|["']$/g, '');
}

const dbHost = requireEnv('DB_HOST');

export interface TmdbCredentials {
  accessToken?: string;
  apiKey?: string;
}

function resolveTmdbCredentials(): TmdbCredentials {
  const accessToken = cleanEnv(process.env.TMDB_ACCESS_TOKEN);
  const apiKey = cleanEnv(process.env.TMDB_API_KEY);

  if (!accessToken && !apiKey) {
    throw new Error('Missing required environment variable: TMDB_API_KEY or TMDB_ACCESS_TOKEN');
  }

  return { accessToken, apiKey };
}

export const env = {
  port: parseInt(process.env.PORT || process.env.BACKEND_PORT || '4000', 10),
  jwtSecret: requireEnv('JWT_SECRET'),
  db: {
    host: dbHost,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: requireEnv('DB_USER'),
    password: process.env.DB_PASSWORD || '',
    name: requireEnv('DB_NAME'),
    ssl:
      process.env.DB_SSL === 'true' ||
      (process.env.DB_SSL !== 'false' && dbHost.includes('tidbcloud.com')),
  },
  tmdb: resolveTmdbCredentials(),
};
