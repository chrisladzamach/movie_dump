import { Router } from 'express';
import { movieController } from '../controllers/movie.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authMiddleware);

router.post('/register', asyncHandler((req, res) => movieController.register(req, res)));
router.get('/latest', asyncHandler((req, res) => movieController.getLatest(req, res)));
router.get('/search', asyncHandler((req, res) => movieController.searchLocal(req, res)));
router.get('/check/:tmdbId', asyncHandler((req, res) => movieController.checkOtherView(req, res)));
router.get('/:id', asyncHandler((req, res) => movieController.getById(req, res)));
router.get('/', asyncHandler((req, res) => movieController.getAll(req, res)));

export default router;
