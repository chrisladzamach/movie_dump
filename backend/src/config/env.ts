import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const dbHost = requireEnv('DB_HOST');

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function resolveTmdbAuth(): { mode: 'bearer' | 'api_key'; value: string } {
  const accessToken = process.env.TMDB_ACCESS_TOKEN?.trim();
  if (accessToken) {
    return { mode: 'bearer', value: accessToken };
  }

  const apiKey = process.env.TMDB_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('Missing required environment variable: TMDB_API_KEY or TMDB_ACCESS_TOKEN');
  }

  if (UUID_REGEX.test(apiKey)) {
    return { mode: 'bearer', value: apiKey };
  }

  return { mode: 'api_key', value: apiKey };
}

export const env = {
  // Render inyecta PORT; en local se usa BACKEND_PORT
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
  tmdb: resolveTmdbAuth(),
};
