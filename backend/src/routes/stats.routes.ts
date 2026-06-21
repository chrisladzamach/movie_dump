import { Router } from 'express';
import { statsController } from '../controllers/stats.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authMiddleware);
router.get('/', asyncHandler((req, res) => statsController.getOverview(req, res)));

export default router;
