import { Router } from 'express';
import { commentController } from '../controllers/comment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authMiddleware);

router.post('/:movieId', asyncHandler((req, res) => commentController.add(req, res)));
router.get('/:movieId', asyncHandler((req, res) => commentController.getAll(req, res)));

export default router;
