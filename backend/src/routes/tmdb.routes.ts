import { Router } from 'express';
import { tmdbController } from '../controllers/tmdb.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authMiddleware);

router.get('/search', asyncHandler((req, res) => tmdbController.search(req, res)));
router.get('/:id', asyncHandler((req, res) => tmdbController.getDetails(req, res)));

export default router;
