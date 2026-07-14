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
 *     summary: Get stats overview for the logged-in user (total volume, heaviest lift, sessions completed), optionally filtered by date range
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: range
 *         required: true
 *         schema:
 *           type: string
 *           enum: [week, month, lifetime]
 *         description: Rolling date window to compute stats over (week = last 7 days, month = last 30 days, lifetime = no date filter)
 *     responses:
 *       200:
 *         description: Stats overview
 *       400:
 *         description: Invalid or missing range value
 *       401:
 *         description: Unauthorized
 */
router.get('/overview', getOverview);

export default router;
