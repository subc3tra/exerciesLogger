import { Router } from 'express';

const router = Router();


/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     responses:
 *       200:
 *         description: Server is running
 */
router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default router;