import type {SignOptions } from 'jsonwebtoken';

export const jwtConfig = {
  secret: process.env.JWT_SECRECT!,
  expiresIn: '1d' as SignOptions['expiresIn']
}