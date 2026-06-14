import { Response } from 'express';
import { watchlistService } from '../services/watchlist.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class WatchlistController {
  async add(req: AuthRequest, res: Response) {
    try {
      const result = await watchlistService.addToWatchlist(
        req.user!.userId,
        req.user!.username,
        req.body
      );
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async getAll(req: AuthRequest, res: Response) {
    try {
      const items = await watchlistService.getWatchlist(req.user!.userId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async remove(req: AuthRequest, res: Response) {
    try {
      await watchlistService.removeFromWatchlist(Number(req.params.movieId), req.user!.userId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }
}

export const watchlistController = new WatchlistController();
