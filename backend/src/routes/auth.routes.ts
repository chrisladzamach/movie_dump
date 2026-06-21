import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/register', asyncHandler((req, res) => authController.register(req, res)));
router.post('/login', asyncHandler((req, res) => authController.login(req, res)));
router.get('/profile', authMiddleware, asyncHandler((req, res) => authController.profile(req, res)));

export default router;
