import { Router } from "express";
import { getMine, confirm, requestEdit } from "../controllers/programDraft.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// private — the client needs a real account (created manually today) to reach their
// own draft. No id in any of these routes: always "my" draft, resolved from the JWT,
// never an id a caller could tamper with to look at someone else's.
router.use(authenticate);

/**
 * @swagger
 * /api/program-drafts/me:
 *   get:
 *     tags:
 *       - Program Drafts
 *     summary: Get the logged-in user's current program draft
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Draft found
 *       404:
 *         description: No draft found
 *       401:
 *         description: Unauthorized
 */
router.get('/me', getMine);

/**
 * @swagger
 * /api/program-drafts/me/confirm:
 *   patch:
 *     tags:
 *       - Program Drafts
 *     summary: Confirm the draft as-is — creates the real Program from the stored draft JSON
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Program created from the draft
 *       400:
 *         description: Draft data invalid, or references an exercise not in the bank
 *       404:
 *         description: No draft found
 *       409:
 *         description: Draft was already confirmed
 *       401:
 *         description: Unauthorized
 */
router.patch('/me/confirm', confirm);

/**
 * @swagger
 * /api/program-drafts/me/request-edit:
 *   patch:
 *     tags:
 *       - Program Drafts
 *     summary: Leave a free-text edit request on the draft instead of confirming
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notes
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Edit request saved
 *       400:
 *         description: Notes missing or empty
 *       404:
 *         description: No draft found
 *       401:
 *         description: Unauthorized
 */
router.patch('/me/request-edit', requestEdit);

export default router;
