import { Request, Response } from 'express';
import { logFeedback } from '../utils/log';

export function submitFeedback(req: Request, res: Response): void {
  const { message } = req.body;
  const username = req.user!.username;

  logFeedback(username, message);
  res.status(201).json({ message: 'Feedback logged' });
}
