import { NextFunction, Request, Response } from 'express';
import { getAllExercises } from '../services/exercise.service';

// get all exercises visible to the logged-in user (global + owned)
export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const exercises = await getAllExercises(userId);
    res.status(200).json({ exercises });
  } catch (err) {
    next(err);
  }
}
