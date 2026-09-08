import { Router } from "express";
import rateLimit from "express-rate-limit";
import { submitIntake } from "../controllers/programGeneration.controller";

const router = Router();

// Guardrail for this public, unauthenticated endpoint — no login exists yet for the
// client filling this in, so this rate limit is the only thing between the internet
// and this endpoint (paired with the honeypot check in the controller).
const intakeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many submissions, please try again later.' }
});

/**
 * @swagger
 * /api/program-generation/intake:
 *   post:
 *     tags:
 *       - Program Generation
 *     summary: Submit a client intake form (public — no auth, rate-limited + honeypot-guarded)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - goal
 *               - experienceLevel
 *               - availableTime
 *             properties:
 *               firstName:
 *                 type: string
 *               goal:
 *                 type: string
 *               experienceLevel:
 *                 type: string
 *               age:
 *                 type: integer
 *               weight:
 *                 type: integer
 *               height:
 *                 type: integer
 *               injuriesOrLimitations:
 *                 type: string
 *               availableTime:
 *                 type: string
 *               equipmentAccess:
 *                 type: string
 *               otherParallelTraining:
 *                 type: string
 *               preferredExercises:
 *                 type: string
 *               programLengthWeeks:
 *                 type: integer
 *               website:
 *                 type: string
 *                 description: Honeypot field — leave empty. Should be hidden via CSS on the frontend, never shown to real users.
 *     responses:
 *       201:
 *         description: Submission recorded
 *       400:
 *         description: Invalid submission
 *       429:
 *         description: Too many submissions from this IP
 */
router.post('/intake', intakeLimiter, submitIntake);

export default router;
