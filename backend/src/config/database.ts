import mysql from 'mysql2/promise';
import { env } from './env';

export const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  ...(env.db.ssl && {
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true,
    },
  }),
});

export async function testConnection(): Promise<void> {
  const connection = await pool.getConnection();
  await connection.ping();
  connection.release();
}
