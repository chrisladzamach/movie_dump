import { Response } from 'express';
import { tmdbService } from '../services/tmdb.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class TmdbController {
  async search(req: AuthRequest, res: Response) {
    try {
      const query = (req.query.q as string) || '';
      if (!query.trim()) {
        res.json([]);
        return;
      }
      const results = await tmdbService.searchMovies(query);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async getDetails(req: AuthRequest, res: Response) {
    try {
      const tmdbId = Number(req.params.id);
      const details = await tmdbService.getMovieDetails(tmdbId);
      res.json(details);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
}

export const tmdbController = new TmdbController();
