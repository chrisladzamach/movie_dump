import { Response } from 'express';
import { commentService } from '../services/comment.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class CommentController {
  async add(req: AuthRequest, res: Response) {
    try {
      const comments = await commentService.addComment(
        Number(req.params.movieId),
        req.user!.userId,
        req.user!.username,
        req.body.content
      );
      res.status(201).json(comments);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async getAll(req: AuthRequest, res: Response) {
    try {
      const comments = await commentService.getComments(Number(req.params.movieId));
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
}

export const commentController = new CommentController();
