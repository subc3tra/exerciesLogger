import { Request, Response } from 'express';
import { findUser, createUser } from '../services/auth.service';
import { hashPassword, comparePassword } from '../utils/hash';
import { signToken } from '../utils/jwt';

export async function register(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body;

  const userExists = await findUser(username);
  if (userExists) {
    res.status(409).json({ message: 'User already exists'});
    return;
  }
  
  // hash password
  const hashedPassword = await hashPassword(password);

  await createUser(username, hashedPassword);
  res.status(201).json({ message: 'User created'});
  return;
}

export async function login(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body;

  // compare password
  const user = await findUser(username);
  if (!user) {
    res.status(401).json({ message: 'Authentication failed'});
    return;
  }

  const passwordCheck = await comparePassword(password, user?.password);
  if (!passwordCheck) {
    res.status(401).json({message: 'Authentication failed'});
    return;
  }

  const token = signToken({ id: user.id, username: user.username});
  res.status(200).json({ message: 'Login successfull', token});
  return;
}

