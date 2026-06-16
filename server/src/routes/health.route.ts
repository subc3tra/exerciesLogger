import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();


/**
 * @swagger
 * /api/health:
 *   get:
 *     tags:
 *       - Checks
 *     summary: Health check
 *     responses:
 *       200:
 *         description: Server is running
 *     security:
 *       - bearerAuth: []
 */
router.get('/health', requireAuth, (_req, res) => {
  res.json({ status: 'ok' });
});

export default router;