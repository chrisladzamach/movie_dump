import { movieRepository } from '../repositories/movie.repository';
import { movieViewRepository } from '../repositories/movieView.repository';
import { watchlistRepository } from '../repositories/watchlist.repository';
import { calculateOverallRating, validateRatings } from '../utils/rating';
import { emitDataUpdate, emitNotification } from '../config/socket';
import { MovieFilters, MovieWithViews, RegisterMovieInput, Movie, CastMember, Genre } from '../models/types';
import { pool } from '../config/database';
import { parseJsonField } from '../utils/jsonField';
import { RowDataPacket } from 'mysql2';

function parseMovie(row: RowDataPacket) {
  return {
    ...row,
    genres: parseJsonField<Genre[]>(row.genres),
    cast_data: parseJsonField<CastMember[]>(row.cast_data),
  };
}

function resolveWatchedBy(views: Array<{ user_id: number; username: string }>, currentUserId: number): 'yo' | 'ambos' | string {
  const myView = views.find((v) => v.user_id === currentUserId);
  const otherViews = views.filter((v) => v.user_id !== currentUserId);

  if (myView && otherViews.length > 0) return 'ambos';
  if (myView) return 'yo';
  if (otherViews.length === 1) return otherViews[0].username;
  if (otherViews.length > 1) return otherViews.map((v) => v.username).join(', ');
  return 'yo';
}

export class MovieService {
  async registerMovie(userId: number, username: string, input: RegisterMovieInput) {
    const ratings = [
      input.photographyRating,
      input.soundtrackRating,
      input.screenplayRating,
      input.castRating,
    ];
    if (!validateRatings(ratings)) {
      throw new Error('Las puntuaciones deben ser enteros entre 0 y 5');
    }

    const watchedDate = new Date(input.watchedAt);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (watchedDate > today) {
      throw new Error('La fecha vista no puede ser futura');
    }

    const overallRating = calculateOverallRating(
      input.photographyRating,
      input.soundtrackRating,
      input.screenplayRating,
      input.castRating
    );
    const movieId = await movieRepository.upsert(input);
    const existingView = await movieViewRepository.findByMovieAndUser(movieId, userId);
    const isUpdate = Boolean(existingView);

    await movieViewRepository.createOrUpdate(movieId, userId, {
      watchedAt: input.watchedAt,
      photographyRating: input.photographyRating,
      soundtrackRating: input.soundtrackRating,
      screenplayRating: input.screenplayRating,
      castRating: input.castRating,
      overallRating,
      observation: input.observation,
      isFavorite: input.isFavorite,
    });

    await watchlistRepository.remove(movieId, userId);

    const movie = await this.getMovieById(movieId, userId);

    emitDataUpdate(isUpdate ? 'movie_updated' : 'movie_registered', movie);
    emitNotification(
      {
        type: isUpdate ? 'movie_updated' : 'movie_registered',
        movieId,
        movieTitle: input.title,
        username,
      },
      userId
    );

    return movie;
  }

  async getMovieById(movieId: number, userId: number): Promise<MovieWithViews> {
    const movie = await movieRepository.findById(movieId);
    if (!movie) throw new Error('Película no encontrada');

    const views = await movieViewRepository.findByMovieId(movieId);
    const watchedBy = resolveWatchedBy(views, userId);

    return {
      ...movie,
      views,
      watched_by: watchedBy as MovieWithViews['watched_by'],
      my_view: views.find((v) => v.user_id === userId),
      other_view: views.find((v) => v.user_id !== userId),
    };
  }

  async getLatest(limit = 10, userId: number) {
    return movieViewRepository.getLatest(limit, userId);
  }

  async searchLocal(query: string) {
    return movieRepository.searchLocal(query);
  }

  async getMovies(userId: number, filters: MovieFilters) {
    const conditions: string[] = [];
    const params: Record<string, unknown> = { userId };

    if (filters.search) {
      conditions.push('m.title LIKE :search');
      params.search = `%${filters.search}%`;
    }

    if (filters.genre) {
      conditions.push('JSON_SEARCH(m.genres, \'one\', :genre, NULL, \'$[*].name\') IS NOT NULL');
      params.genre = filters.genre;
    }

    if (filters.favorite !== undefined) {
      conditions.push('mv.is_favorite = :favorite');
      params.favorite = filters.favorite;
    }

    if (filters.minRating !== undefined) {
      conditions.push('mv.overall_rating >= :minRating');
      params.minRating = filters.minRating;
    }

    if (filters.maxRating !== undefined) {
      conditions.push('mv.overall_rating <= :maxRating');
      params.maxRating = filters.maxRating;
    }

    if (filters.releaseYear) {
      conditions.push('YEAR(m.release_date) = :releaseYear');
      params.releaseYear = filters.releaseYear;
    }

    if (filters.watchedFrom) {
      conditions.push('mv.watched_at >= :watchedFrom');
      params.watchedFrom = filters.watchedFrom;
    }

    if (filters.watchedTo) {
      conditions.push('mv.watched_at <= :watchedTo');
      params.watchedTo = filters.watchedTo;
    }

    if (filters.watchedBy === 'me') {
      conditions.push('mv.user_id = :userId');
    } else if (filters.watchedBy === 'other') {
      conditions.push('mv.user_id != :userId');
    } else if (filters.watchedBy === 'both') {
      conditions.push(
        `m.id IN (
          SELECT mv1.movie_id FROM movie_views mv1
          INNER JOIN movie_views mv2 ON mv1.movie_id = mv2.movie_id
          WHERE mv1.user_id = :userId AND mv2.user_id != :userId
        )`
      );
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT DISTINCT m.*, MAX(mv.watched_at) as last_watched,
              AVG(mv.overall_rating) as avg_rating
       FROM movies m
       INNER JOIN movie_views mv ON mv.movie_id = m.id
       ${whereClause}
       GROUP BY m.id
       ORDER BY last_watched DESC`,
      params as Record<string, string | number | boolean>
    );

    const movies = await Promise.all(
      rows.map(async (row) => {
        const movie = parseMovie(row) as Movie;
        const views = await movieViewRepository.findByMovieId(movie.id);
        return {
          ...movie,
          views,
          watched_by: resolveWatchedBy(views, userId),
          avg_rating: Math.round(Number(row.avg_rating) * 100) / 100,
          my_view: views.find((v) => v.user_id === userId),
          other_view: views.find((v) => v.user_id !== userId),
        };
      })
    );

    return movies;
  }

  async checkOtherUserView(tmdbId: number, userId: number) {
    const movie = await movieRepository.findByTmdbId(tmdbId);
    if (!movie) return { exists: false, otherView: null, myView: null };

    const views = await movieViewRepository.findByMovieId(movie.id);
    return {
      exists: true,
      movieId: movie.id,
      otherView: views.find((v) => v.user_id !== userId) || null,
      myView: views.find((v) => v.user_id === userId) || null,
      watchedBy: resolveWatchedBy(views, userId),
    };
  }
}

export const movieService = new MovieService();
