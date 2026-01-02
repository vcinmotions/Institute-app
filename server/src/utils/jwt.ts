import * as jwt from 'jsonwebtoken'
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const JWT_SECRET = process.env.JWT_SECRET!

export const generateToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })
}
