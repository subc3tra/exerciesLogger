import { Router } from 'express';
import { getOverview, getProgression } from '../controllers/stats.controller';
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
 *     summary: Get stats overview for the logged-in user (total volume, heaviest lift, sessions completed), optionally filtered by date range and/or a single exercise
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: range
 *         required: false
 *         schema:
 *           type: string
 *           enum: [week, month, lifetime]
 *           default: week
 *         description: Rolling date window to compute stats over (week = last 7 days, month = last 30 days, lifetime = no date filter). Defaults to week if omitted.
 *       - in: query
 *         name: exerciseId
 *         required: false
 *         schema:
 *           type: integer
 *         description: Scope stats to a single exercise. When set, totalSessionsCompleted counts only sessions that included this exercise. Omit for stats across all exercises.
 *     responses:
 *       200:
 *         description: Stats overview
 *       400:
 *         description: Invalid or missing range value
 *       401:
 *         description: Unauthorized
 */
router.get('/overview', getOverview);

/**
 * @swagger
 * /api/stats/progression:
 *   get:
 *     tags:
 *       - Stats
 *     summary: Get weight-over-time progression for a single exercise, one point per session (max completed-set weight that session)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: exerciseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Which exercise to chart progression for.
 *       - in: query
 *         name: range
 *         required: false
 *         schema:
 *           type: string
 *           enum: [week, month, lifetime]
 *           default: week
 *         description: Rolling date window to compute progression over (week = last 7 days, month = last 30 days, lifetime = no date filter). Defaults to week if omitted.
 *     responses:
 *       200:
 *         description: Array of { date, weight } points, sorted chronologically
 *       400:
 *         description: Invalid or missing range/exerciseId value
 *       401:
 *         description: Unauthorized
 */
router.get('/progression', getProgression);

export default router;
