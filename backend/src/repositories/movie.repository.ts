import { pool } from '../config/database';
import { Genre, CastMember, Movie, RegisterMovieInput } from '../models/types';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

function parseMovie(row: RowDataPacket): Movie {
  return {
    ...row,
    genres: row.genres ? JSON.parse(row.genres as string) : null,
    cast_data: row.cast_data ? JSON.parse(row.cast_data as string) : null,
  } as Movie;
}

export class MovieRepository {
  async findByTmdbId(tmdbId: number): Promise<Movie | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM movies WHERE tmdb_id = :tmdbId LIMIT 1',
      { tmdbId }
    );
    return rows[0] ? parseMovie(rows[0]) : null;
  }

  async findById(id: number): Promise<Movie | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM movies WHERE id = :id LIMIT 1',
      { id }
    );
    return rows[0] ? parseMovie(rows[0]) : null;
  }

  async upsert(input: RegisterMovieInput): Promise<number> {
    const existing = await this.findByTmdbId(input.tmdbId);

    if (existing) {
      await pool.query(
        `UPDATE movies SET title = :title, poster_path = :posterPath, release_date = :releaseDate,
         genres = :genres, overview = :overview, cast_data = :castData WHERE id = :id`,
        {
          id: existing.id,
          title: input.title,
          posterPath: input.posterPath || null,
          releaseDate: input.releaseDate || null,
          genres: JSON.stringify(input.genres || []),
          overview: input.overview || null,
          castData: JSON.stringify(input.cast || []),
        }
      );
      return existing.id;
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO movies (tmdb_id, title, poster_path, release_date, genres, overview, cast_data)
       VALUES (:tmdbId, :title, :posterPath, :releaseDate, :genres, :overview, :castData)`,
      {
        tmdbId: input.tmdbId,
        title: input.title,
        posterPath: input.posterPath || null,
        releaseDate: input.releaseDate || null,
        genres: JSON.stringify(input.genres || []),
        overview: input.overview || null,
        castData: JSON.stringify(input.cast || []),
      }
    );
    return result.insertId;
  }

  async searchLocal(query: string, limit = 20): Promise<Movie[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM movies WHERE title LIKE :query ORDER BY title ASC LIMIT :limit`,
      { query: `%${query}%`, limit }
    );
    return rows.map(parseMovie);
  }

  async findAllWithFilters(
    whereClause: string,
    params: Record<string, unknown>,
    orderBy = 'mv.watched_at DESC'
  ): Promise<Movie[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT DISTINCT m.* FROM movies m
       INNER JOIN movie_views mv ON mv.movie_id = m.id
       ${whereClause}
       ORDER BY ${orderBy}`,
      params as Record<string, string | number | boolean>
    );
    return rows.map(parseMovie);
  }
}

export const movieRepository = new MovieRepository();
