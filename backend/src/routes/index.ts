import { Router } from 'express';
import authRoutes from './auth.routes';
import movieRoutes from './movie.routes';
import tmdbRoutes from './tmdb.routes';
import watchlistRoutes from './watchlist.routes';
import statsRoutes from './stats.routes';
import commentRoutes from './comment.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/movies', movieRoutes);
router.use('/tmdb', tmdbRoutes);
router.use('/watchlist', watchlistRoutes);
router.use('/stats', statsRoutes);
router.use('/comments', commentRoutes);

export default router;
