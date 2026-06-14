import { pool } from '../config/database';
import { WatchlistItem } from '../models/types';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class WatchlistRepository {
  async add(movieId: number, userId: number): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT IGNORE INTO watchlist (movie_id, user_id) VALUES (:movieId, :userId)`,
      { movieId, userId }
    );
    return result.insertId;
  }

  async remove(movieId: number, userId: number): Promise<void> {
    await pool.query('DELETE FROM watchlist WHERE movie_id = :movieId AND user_id = :userId', {
      movieId,
      userId,
    });
  }

  async findByUser(userId: number): Promise<
    Array<
      WatchlistItem & {
        title: string;
        poster_path: string | null;
        tmdb_id: number;
        release_date: string | null;
        has_view: boolean;
        other_has_view: boolean;
      }
    >
  > {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT w.*, m.title, m.poster_path, m.tmdb_id, m.release_date,
              EXISTS(SELECT 1 FROM movie_views mv WHERE mv.movie_id = m.id AND mv.user_id = :userId) as has_view,
              EXISTS(SELECT 1 FROM movie_views mv WHERE mv.movie_id = m.id AND mv.user_id != :userId) as other_has_view
       FROM watchlist w
       INNER JOIN movies m ON m.id = w.movie_id
       WHERE w.user_id = :userId
       ORDER BY w.added_at DESC`,
      { userId }
    );
    return rows.map((r) => ({
      ...r,
      has_view: Boolean(r.has_view),
      other_has_view: Boolean(r.other_has_view),
    })) as Array<
      WatchlistItem & {
        title: string;
        poster_path: string | null;
        tmdb_id: number;
        release_date: string | null;
        has_view: boolean;
        other_has_view: boolean;
      }
    >;
  }

  async exists(movieId: number, userId: number): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM watchlist WHERE movie_id = :movieId AND user_id = :userId LIMIT 1',
      { movieId, userId }
    );
    return rows.length > 0;
  }
}

export const watchlistRepository = new WatchlistRepository();
