import { Router } from "express";
import { submitFeedback } from "../controllers/feedback.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     tags:
 *       - Feedback
 *     summary: Log a piece of user feedback to the file-based feedback log
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Feedback logged
 *       401:
 *         description: Unauthorized
 */
router.post('/', submitFeedback);

export default router;
