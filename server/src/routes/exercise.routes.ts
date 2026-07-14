import { Router } from 'express';
import { getAll } from '../controllers/exercise.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// apply auth middleware to all exercise routes
router.use(authenticate);

/**
 * @swagger
 * /api/exercises:
 *   get:
 *     tags:
 *       - Exercises
 *     summary: Get all exercises visible to the logged-in user (global bank + their own private exercises)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of exercises
 *       401:
 *         description: Unauthorized
 */
router.get('/', getAll);

export default router;
