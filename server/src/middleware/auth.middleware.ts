import { verifyToken } from "../utils/jwt";
import { Request, Response, NextFunction } from "express";

export function authenticate (req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    res.status(401).json({ message: 'Authentication failed'});
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Authentication failed'});
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;

    next()
  } catch (err) {
    console.error('Invalid token', err);
    res.status(401).json({ message: 'Authentication error'})
    return;
  };  
};