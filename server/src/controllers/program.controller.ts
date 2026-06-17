import { NextFunction, Request, Response } from 'express';
import {
  getAllPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
  getDaysByProgramId,
  getDayById
} from "../services/program.service";

// get all programs for user
export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const programs = await getAllPrograms(userId);
    res.status(200).json({ programs });
  } catch (err) {
    next(err)
  }
}

// get program by id
export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);
    const userId = req.user!.id;
    const program = await getProgramById(id, userId);

    if (!program) {
      res.status(404).json({ message: "Program not found" });
      return;
    }

    res.status(200).json({ program });
  } catch (err) {
    next(err);
  }
}

// create program
export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { name, totalWeeks, daysPerWeek } = req.body;
    const program = await createProgram(name, totalWeeks, daysPerWeek, userId);
    res.status(201).json({ program });
  } catch (err) {
    next(err);
  }
}

// update program
export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);
    const userId = req.user!.id;
    const { name, totalWeeks, daysPerWeek, status } = req.body;
    const program = await updateProgram(id, userId, name, totalWeeks, daysPerWeek, status);

    if (!program) {
      res.status(404).json({ message: "Program not found" });
      return;
    }

    res.status(200).json({ program });
  } catch (err) {
    next(err);
  }
}

// delete program
export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);
    const userId = req.user!.id;
    const program = await deleteProgram(id, userId);

    if (!program) {
      res.status(404).json({ message: "Program not found" });
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// get workout days
export async function getDays(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const programId = Number(req.params.id);
    const userId = req.user!.id;
    const days = await getDaysByProgramId(programId, userId);

    if (days.length === 0) {
      res.status(404).json({ message: "Days not found" });
      return;
    }

    res.status(200).json({ days });
  } catch (err) {
    next(err);
  }
}

// get workout day
export async function getDay(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);
    const userId = req.user!.id;
    const day = await getDayById(id, userId);
    if (!day) {
      res.status(404).json({ message: "Day not found" });
      return;
    }
    res.status(200).json({ day });
  } catch (err) {
    next(err);
  }
}