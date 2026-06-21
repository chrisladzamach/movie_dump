import { pool } from '../config/database';
import { MovieView, MovieViewWithUser, Genre } from '../models/types';
import { parseJsonField } from '../utils/jsonField';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class MovieViewRepository {
  async findByMovieAndUser(movieId: number, userId: number): Promise<MovieView | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM movie_views WHERE movie_id = :movieId AND user_id = :userId LIMIT 1',
      { movieId, userId }
    );
    return (rows[0] as MovieView) || null;
  }

  async findByMovieId(movieId: number): Promise<MovieViewWithUser[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT mv.*, u.username FROM movie_views mv
       INNER JOIN users u ON u.id = mv.user_id
       WHERE mv.movie_id = :movieId`,
      { movieId }
    );
    return rows as MovieViewWithUser[];
  }

  async createOrUpdate(
    movieId: number,
    userId: number,
    data: {
      watchedAt: string;
      photographyRating: number;
      soundtrackRating: number;
      screenplayRating: number;
      castRating: number;
      overallRating: number;
      observation?: string;
      isFavorite?: boolean;
    }
  ): Promise<number> {
    const existing = await this.findByMovieAndUser(movieId, userId);

    if (existing) {
      await pool.query(
        `UPDATE movie_views SET watched_at = :watchedAt, photography_rating = :photographyRating,
         soundtrack_rating = :soundtrackRating, screenplay_rating = :screenplayRating,
         cast_rating = :castRating, overall_rating = :overallRating, observation = :observation,
         is_favorite = :isFavorite WHERE id = :id`,
        {
          id: existing.id,
          watchedAt: data.watchedAt,
          photographyRating: data.photographyRating,
          soundtrackRating: data.soundtrackRating,
          screenplayRating: data.screenplayRating,
          castRating: data.castRating,
          overallRating: data.overallRating,
          observation: data.observation || null,
          isFavorite: data.isFavorite ?? false,
        }
      );
      return existing.id;
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO movie_views (movie_id, user_id, watched_at, photography_rating, soundtrack_rating,
       screenplay_rating, cast_rating, overall_rating, observation, is_favorite)
       VALUES (:movieId, :userId, :watchedAt, :photographyRating, :soundtrackRating, :screenplayRating,
       :castRating, :overallRating, :observation, :isFavorite)`,
      {
        movieId,
        userId,
        watchedAt: data.watchedAt,
        photographyRating: data.photographyRating,
        soundtrackRating: data.soundtrackRating,
        screenplayRating: data.screenplayRating,
        castRating: data.castRating,
        overallRating: data.overallRating,
        observation: data.observation || null,
        isFavorite: data.isFavorite ?? false,
      }
    );
    return result.insertId;
  }

  async getLatest(
    limit: number,
    currentUserId: number
  ): Promise<Array<MovieViewWithUser & { title: string; poster_path: string | null; tmdb_id: number; usernames: string }>> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT mv.*, u.username, m.title, m.poster_path, m.tmdb_id, all_usernames.usernames
       FROM movie_views mv
       INNER JOIN users u ON u.id = mv.user_id
       INNER JOIN movies m ON m.id = mv.movie_id
       INNER JOIN (
         SELECT mv2.movie_id, GROUP_CONCAT(DISTINCT u2.username ORDER BY u2.username SEPARATOR ', ') AS usernames
         FROM movie_views mv2
         INNER JOIN users u2 ON u2.id = mv2.user_id
         GROUP BY mv2.movie_id
       ) all_usernames ON all_usernames.movie_id = mv.movie_id
       WHERE mv.user_id = :currentUserId
       ORDER BY mv.watched_at DESC, mv.updated_at DESC
       LIMIT :limit`,
      { limit, currentUserId }
    );
    return rows as Array<MovieViewWithUser & { title: string; poster_path: string | null; tmdb_id: number; usernames: string }>;
  }

  async getStats(): Promise<{
    totalWatched: number;
    averageRating: number;
    totalFavorites: number;
  }> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as totalWatched,
              COALESCE(AVG(overall_rating), 0) as averageRating,
              SUM(CASE WHEN is_favorite = 1 THEN 1 ELSE 0 END) as totalFavorites
       FROM movie_views`
    );
    const row = rows[0];
    return {
      totalWatched: Number(row.totalWatched),
      averageRating: Math.round(Number(row.averageRating) * 100) / 100,
      totalFavorites: Number(row.totalFavorites),
    };
  }

  async getTopRated(limit: number): Promise<
    Array<{ id: number; title: string; poster_path: string | null; overall_rating: number }>
  > {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT m.id, m.title, m.poster_path, AVG(mv.overall_rating) as overall_rating
       FROM movies m
       INNER JOIN movie_views mv ON mv.movie_id = m.id
       GROUP BY m.id, m.title, m.poster_path
       ORDER BY overall_rating DESC
       LIMIT :limit`,
      { limit }
    );
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      poster_path: r.poster_path,
      overall_rating: Math.round(Number(r.overall_rating) * 100) / 100,
    }));
  }

  async getGenreCounts(): Promise<Array<{ genre: string; count: number }>> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT m.genres FROM movies m INNER JOIN movie_views mv ON mv.movie_id = m.id`
    );

    const counts = new Map<string, number>();
    for (const row of rows) {
      const genres = parseJsonField<Genre[]>(row.genres) || [];
      for (const g of genres) {
        counts.set(g.name, (counts.get(g.name) || 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count);
  }
}

export const movieViewRepository = new MovieViewRepository();
