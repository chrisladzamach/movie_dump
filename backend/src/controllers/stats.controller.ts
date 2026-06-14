import { Response } from 'express';
import { statsService } from '../services/stats.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class StatsController {
  async getOverview(req: AuthRequest, res: Response) {
    try {
      const stats = await statsService.getOverview();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
}

export const statsController = new StatsController();
