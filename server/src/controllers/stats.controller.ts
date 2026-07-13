import { NextFunction, Request, Response } from 'express';
import { getStatsOverview } from '../services/stats.service';

// get stats overview
export async function getOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const stats = await getStatsOverview(userId);
    res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
}
