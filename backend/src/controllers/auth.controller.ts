import { Response } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class AuthController {
  async register(req: AuthRequest, res: Response) {
    try {
      const { username, email, password } = req.body;
      const result = await authService.register(username, email, password);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async login(req: AuthRequest, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      res.status(401).json({ message: (error as Error).message });
    }
  }

  async profile(req: AuthRequest, res: Response) {
    try {
      const result = await authService.getProfile(req.user!.userId);
      res.json(result);
    } catch (error) {
      res.status(404).json({ message: (error as Error).message });
    }
  }
}

export const authController = new AuthController();
