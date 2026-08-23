import { Router } from "express";
import { getAll, getById, getProgress, create, update, updateExerciseNotes, remove, getDays, getDay } from "../controllers/program.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// apply auth middleware to all program routes
router.use(authenticate);

/**
 * @swagger
 * /api/programs:
 *   get:
 *     tags:
 *       - Programs
 *     summary: Get all programs for logged-in user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of programs
 *       401:
 *         description: Unauthorized
 */
router.get('/', getAll);

/**
 * @swagger
 * /api/programs:
 *   post:
 *     tags:
 *       - Programs
 *     summary: Create a new program
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - totalWeeks
 *               - daysPerWeek
 *             properties:
 *               name:
 *                 type: string
 *               totalWeeks:
 *                 type: integer
 *               daysPerWeek:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Program created
 *       401:
 *         description: Unauthorized
 */
router.post('/', create);

/**
 * @swagger
 * /api/programs/{id}:
 *   get:
 *     tags:
 *       - Programs
 *     summary: Get program by id (fully nested with days, sections, exercises)
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
 *         description: Program found
 *       404:
 *         description: Program not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', getById);

/**
 * @swagger
 * /api/programs/{id}/progress:
 *   get:
 *     tags:
 *       - Programs
 *     summary: Get completed session count and current active session for a program
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
 *         description: Program progress
 *       404:
 *         description: Program not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/progress', getProgress);

/**
 * @swagger
 * /api/programs/{id}:
 *   patch:
 *     tags:
 *       - Programs
 *     summary: Update program name, week count or status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               totalWeeks:
 *                 type: integer
 *               daysPerWeek:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, ARCHIVED]
 *     responses:
 *       200:
 *         description: Program updated
 *       404:
 *         description: Program not found
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id', update);

/**
 * @swagger
 * /api/programs/{id}:
 *   delete:
 *     tags:
 *       - Programs
 *     summary: Delete a program
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Program deleted
 *       404:
 *         description: Program not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', remove);

/**
 * @swagger
 * /api/programs/{id}/days:
 *   get:
 *     tags:
 *       - Programs
 *     summary: Get all days for a program
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
 *         description: List of days
 *       404:
 *         description: Program not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/days', getDays);

/**
 * @swagger
 * /api/programs/{id}/exercises/{exerciseId}/notes:
 *   patch:
 *     tags:
 *       - Programs
 *     summary: Update the persistent note on a program exercise (e.g. "use the red band") — carries forward every time this exercise comes up in the program, independent of any single session
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: exerciseId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Note updated
 *       404:
 *         description: Exercise not found
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id/exercises/:exerciseId/notes', updateExerciseNotes);

export default router;