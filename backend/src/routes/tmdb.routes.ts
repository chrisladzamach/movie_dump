import { Router } from 'express';
import { tmdbController } from '../controllers/tmdb.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/search', (req, res) => tmdbController.search(req, res));
router.get('/:id', (req, res) => tmdbController.getDetails(req, res));

export default router;
