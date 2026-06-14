import { Router } from 'express';
import { movieController } from '../controllers/movie.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/register', (req, res) => movieController.register(req, res));
router.get('/latest', (req, res) => movieController.getLatest(req, res));
router.get('/search', (req, res) => movieController.searchLocal(req, res));
router.get('/check/:tmdbId', (req, res) => movieController.checkOtherView(req, res));
router.get('/:id', (req, res) => movieController.getById(req, res));
router.get('/', (req, res) => movieController.getAll(req, res));

export default router;
