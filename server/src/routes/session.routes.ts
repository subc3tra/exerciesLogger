import { Router } from "express";
import { getAll, getById, start, updateSet, removeSet, addSet } from "../controllers/session.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// apply auth middleware to all session routes
router.use(authenticate);

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     tags:
 *       - Sessions
 *     summary: Get all sessions for logged-in user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sessions
 *       401:
 *         description: Unauthorized
 */
router.get('/', getAll);

/**
 * @swagger
 * /api/sessions/start:
 *   post:
 *     tags:
 *       - Sessions
 *     summary: Start a new session for a program day, or resume an in-progress one
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - programDayId
 *             properties:
 *               programDayId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Session started (or resumed), with prefill data
 *       404:
 *         description: Program day not found
 *       401:
 *         description: Unauthorized
 */
router.post('/start', start);

/**
 * @swagger
 * /api/sessions/{id}:
 *   get:
 *     tags:
 *       - Sessions
 *     summary: Get session by id (full detail with all sets)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Session found
 *       404:
 *         description: Session not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', getById);

/**
 * @swagger
 * /api/sessions/{id}/sets/{setId}:
 *   patch:
 *     tags:
 *       - Sessions
 *     summary: Update a single set (reps, weight, duration, completed, notes)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: setId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reps:
 *                 type: integer
 *               weight:
 *                 type: number
 *               duration:
 *                 type: integer
 *               completed:
 *                 type: boolean
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Set updated
 *       404:
 *         description: Set not found
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id/sets/:setId', updateSet);

/**
 * @swagger
 * /api/sessions/{id}/sets/{setId}:
 *   delete:
 *     tags:
 *       - Sessions
 *     summary: Remove a set row (deviating from the planned target sets)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: setId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Set removed
 *       404:
 *         description: Set not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id/sets/:setId', removeSet);

/**
 * @swagger
 * /api/sessions/{id}/exercises/{sessionExerciseId}/sets:
 *   post:
 *     tags:
 *       - Sessions
 *     summary: Add a new set row to a session exercise (deviating from the planned target sets)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: sessionExerciseId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reps:
 *                 type: integer
 *               weight:
 *                 type: number
 *               duration:
 *                 type: integer
 *               completed:
 *                 type: boolean
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Set created
 *       404:
 *         description: Session exercise not found
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/exercises/:sessionExerciseId/sets', addSet);

export default router;
