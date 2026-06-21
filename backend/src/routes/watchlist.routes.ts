import { Router } from 'express';
import { watchlistController } from '../controllers/watchlist.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authMiddleware);

router.post('/', asyncHandler((req, res) => watchlistController.add(req, res)));
router.get('/', asyncHandler((req, res) => watchlistController.getAll(req, res)));
router.delete('/:movieId', asyncHandler((req, res) => watchlistController.remove(req, res)));

export default router;
