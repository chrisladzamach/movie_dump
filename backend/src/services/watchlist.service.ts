import { watchlistRepository } from '../repositories/watchlist.repository';
import { movieRepository } from '../repositories/movie.repository';
import { emitDataUpdate, emitNotification } from '../config/socket';
import { Genre, CastMember } from '../models/types';

export class WatchlistService {
  async addToWatchlist(
    userId: number,
    username: string,
    data: {
      tmdbId: number;
      title: string;
      posterPath?: string | null;
      releaseDate?: string | null;
      genres?: Genre[];
      overview?: string | null;
      cast?: CastMember[];
    }
  ) {
    const movieId = await movieRepository.upsert({
      tmdbId: data.tmdbId,
      title: data.title,
      posterPath: data.posterPath,
      releaseDate: data.releaseDate,
      genres: data.genres,
      overview: data.overview,
      cast: data.cast,
      watchedAt: new Date().toISOString().split('T')[0],
      photographyRating: 0,
      soundtrackRating: 0,
      screenplayRating: 0,
      castRating: 0,
    });

    await watchlistRepository.add(movieId, userId);

    emitDataUpdate('watchlist_added', { movieId, userId });
    emitNotification(
      { type: 'watchlist_added', movieId, movieTitle: data.title, username },
      userId
    );

    return { movieId };
  }

  async getWatchlist(userId: number) {
    return watchlistRepository.findByUser(userId);
  }

  async removeFromWatchlist(movieId: number, userId: number) {
    await watchlistRepository.remove(movieId, userId);
    emitDataUpdate('watchlist_removed', { movieId, userId });
  }
}

export const watchlistService = new WatchlistService();
