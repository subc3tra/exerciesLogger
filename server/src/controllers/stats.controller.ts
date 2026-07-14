import { NextFunction, Request, Response } from 'express';
import { getStatsOverview } from '../services/stats.service';

// get stats overview
export async function getOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const range = req.query.range ?? 'week';

    if (range != 'week' && range != 'month' && range != 'lifetime') {
      res.status(400).json({ message: 'Wrong range used' });
      return;
    }

    const stats = await getStatsOverview(userId, range);
    res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
}
