import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { getDraftByUserId, confirmDraft, requestDraftEdit, DraftAlreadyConfirmedError } from '../services/programDraft.service';

// get the logged-in user's draft
export async function getMine(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const draft = await getDraftByUserId(userId);

    if (!draft) {
      res.status(404).json({ message: 'No draft found' });
      return;
    }

    res.status(200).json({ draft });
  } catch (err) {
    next(err);
  }
}

// confirm the draft — creates the real Program
export async function confirm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const program = await confirmDraft(userId);

    if (!program) {
      res.status(404).json({ message: 'No draft found' });
      return;
    }

    res.status(200).json({ program });
  } catch (err) {
    if (err instanceof DraftAlreadyConfirmedError) {
      res.status(409).json({ message: err.message });
      return;
    }
    // draft's stored programData failed ProgramSchema validation, or referenced an
    // exercise not in the bank — a bad-data problem, not a server error
    if (err instanceof ZodError) {
      res.status(400).json({ message: 'Draft program data is invalid', errors: err.issues });
      return;
    }
    if (err instanceof Error && err.message.startsWith('Exercise(s) not found')) {
      res.status(400).json({ message: err.message });
      return;
    }
    next(err);
  }
}

// leave a free-text edit request instead of confirming
export async function requestEdit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { notes } = req.body;

    if (typeof notes !== 'string' || notes.trim() === '') {
      res.status(400).json({ message: 'Edit request notes are required' });
      return;
    }

    const draft = await requestDraftEdit(userId, notes);

    if (!draft) {
      res.status(404).json({ message: 'No draft found' });
      return;
    }

    res.status(200).json({ draft });
  } catch (err) {
    next(err);
  }
}
