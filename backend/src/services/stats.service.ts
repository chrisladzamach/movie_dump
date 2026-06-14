import { movieViewRepository } from '../repositories/movieView.repository';
import { StatsOverview } from '../models/types';

export class StatsService {
  async getOverview(): Promise<StatsOverview> {
    const [basic, topRated, genreCounts] = await Promise.all([
      movieViewRepository.getStats(),
      movieViewRepository.getTopRated(10),
      movieViewRepository.getGenreCounts(),
    ]);

    return {
      totalWatched: basic.totalWatched,
      averageRating: basic.averageRating,
      totalFavorites: basic.totalFavorites,
      topGenre: genreCounts[0]?.genre || null,
      topRatedMovies: topRated,
    };
  }
}

export const statsService = new StatsService();
