import { Router } from 'express';
import { watchlistController } from '../controllers/watchlist.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', (req, res) => watchlistController.add(req, res));
router.get('/', (req, res) => watchlistController.getAll(req, res));
router.delete('/:movieId', (req, res) => watchlistController.remove(req, res));

export default router;
