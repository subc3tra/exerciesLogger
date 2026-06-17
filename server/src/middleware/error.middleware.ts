import { Request, Response, NextFunction } from "express";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  const status = (err as any).status ?? 500;
  console.error('Server ERROR: ', err);
  res.status(status).json({ message: 'Server error, check logs.'});
}

