import { NextFunction, Request, Response } from 'express';
import {
  getAllSessions,
  getSessionById,
  startSession,
  updateSetById,
  removeSetRow,
  addNewSetRow
} from "../services/session.service";
import { Prisma } from '@prisma/client';

// get all sessions for user
export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const sessions = await getAllSessions(userId);
    res.status(200).json({ sessions });
  } catch (err) {
    next(err);
  }
}

// get session by id
export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);
    const userId = req.user!.id;
    const session = await getSessionById(id, userId);

    if (!session) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    res.status(200).json({ session });
  } catch (err) {
    next(err);
  }
}

// start (or resume) a session
export async function start(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { programDayId } = req.body;
    const result = await startSession(userId, programDayId);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error && err.message === 'Program day not found!') {
      res.status(404).json({ message: err.message });
      return;
    }
    next(err);
  }
}

// update a single set
export async function updateSet(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const setId = Number(req.params.setId);
    const { reps, weight, duration, completed, notes } = req.body;
    const set = await updateSetById(userId, setId, reps, weight, duration, completed, notes);
    res.status(200).json({ set });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      res.status(404).json({ message: "Set not found" });
      return;
    }
    next(err);
  }
}

// remove a set row
export async function removeSet(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const setId = Number(req.params.setId);
    await removeSetRow(userId, setId);
    res.status(204).send();
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      res.status(404).json({ message: "Set not found" });
      return;
    }
    next(err);
  }
}

// add a new set row
export async function addSet(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const sessionExerciseId = Number(req.params.sessionExerciseId);
    const { reps, weight, duration, completed, notes } = req.body;
    const set = await addNewSetRow(userId, sessionExerciseId, reps, weight, duration, completed, notes);
    res.status(201).json({ set });
  } catch (err) {
    if (err instanceof Error && err.message === 'No sessionExercise found!') {
      res.status(404).json({ message: err.message });
      return;
    }
    next(err);
  }
}
