import type {SignOptions } from 'jsonwebtoken';

export const jwtConfig = {
  secret: process.env.JWT_SECRET!,
  expiresIn: '1d' as SignOptions['expiresIn']
}