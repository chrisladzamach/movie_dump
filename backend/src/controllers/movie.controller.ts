import { Response } from 'express';
import { movieService } from '../services/movie.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { MovieFilters } from '../models/types';

export class MovieController {
  async register(req: AuthRequest, res: Response) {
    try {
      const result = await movieService.registerMovie(
        req.user!.userId,
        req.user!.username,
        req.body
      );
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const movie = await movieService.getMovieById(Number(req.params.id), req.user!.userId);
      res.json(movie);
    } catch (error) {
      res.status(404).json({ message: (error as Error).message });
    }
  }

  async getLatest(req: AuthRequest, res: Response) {
    try {
      const limit = Number(req.query.limit) || 10;
      const movies = await movieService.getLatest(limit);
      res.json(movies);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async getAll(req: AuthRequest, res: Response) {
    try {
      const filters: MovieFilters = {
        search: req.query.search as string | undefined,
        genre: req.query.genre as string | undefined,
        favorite: req.query.favorite === 'true' ? true : req.query.favorite === 'false' ? false : undefined,
        minRating: req.query.minRating ? Number(req.query.minRating) : undefined,
        maxRating: req.query.maxRating ? Number(req.query.maxRating) : undefined,
        releaseYear: req.query.releaseYear ? Number(req.query.releaseYear) : undefined,
        watchedFrom: req.query.watchedFrom as string | undefined,
        watchedTo: req.query.watchedTo as string | undefined,
        watchedBy: req.query.watchedBy as MovieFilters['watchedBy'],
      };
      const movies = await movieService.getMovies(req.user!.userId, filters);
      res.json(movies);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async searchLocal(req: AuthRequest, res: Response) {
    try {
      const query = (req.query.q as string) || '';
      const movies = await movieService.searchLocal(query);
      res.json(movies);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async checkOtherView(req: AuthRequest, res: Response) {
    try {
      const tmdbId = Number(req.params.tmdbId);
      const result = await movieService.checkOtherUserView(tmdbId, req.user!.userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
}

export const movieController = new MovieController();
