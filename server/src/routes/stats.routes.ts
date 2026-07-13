import { Router } from 'express';
import { getOverview } from '../controllers/stats.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// apply auth middleware to all stats routes
router.use(authenticate);

/**
 * @swagger
 * /api/stats/overview:
 *   get:
 *     tags:
 *       - Stats
 *     summary: Get lifetime stats overview for the logged-in user (total volume, heaviest lift, sessions completed)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats overview
 *       401:
 *         description: Unauthorized
 */
router.get('/overview', getOverview);

export default router;
