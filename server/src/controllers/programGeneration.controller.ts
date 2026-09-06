import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { createIntakeSubmission } from '../services/programGeneration.service';

// public intake form submission — no auth, filled in directly by the client via a link
export async function submitIntake(req: Request, res: Response, next: NextFunction): Promise<void> {
  // honeypot: a hidden field real users never see or fill in. Bots that auto-fill every
  // input on a page do fill it in. Respond as a normal success so the bot has no signal
  // it was caught, but skip actually writing anything.
  if (req.body.website) {
    res.status(201).json({ message: 'Submission received' });
    return;
  }

  try {
    const submission = await createIntakeSubmission(req.body);
    res.status(201).json({ submission });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: 'Invalid submission', errors: err.issues });
      return;
    }
    next(err);
  }
}
