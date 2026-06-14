import { Router } from 'express';
import { commentController } from '../controllers/comment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/:movieId', (req, res) => commentController.add(req, res));
router.get('/:movieId', (req, res) => commentController.getAll(req, res));

export default router;
