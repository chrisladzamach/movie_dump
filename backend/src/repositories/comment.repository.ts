import { pool } from '../config/database';
import { Comment } from '../models/types';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class CommentRepository {
  async create(movieId: number, userId: number, content: string): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO comments (movie_id, user_id, content) VALUES (:movieId, :userId, :content)',
      { movieId, userId, content }
    );
    return result.insertId;
  }

  async findByMovieId(movieId: number): Promise<Array<Comment & { username: string }>> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT c.*, u.username FROM comments c
       INNER JOIN users u ON u.id = c.user_id
       WHERE c.movie_id = :movieId
       ORDER BY c.created_at DESC`,
      { movieId }
    );
    return rows as Array<Comment & { username: string }>;
  }
}

export const commentRepository = new CommentRepository();
