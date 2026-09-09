import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

export async function attachUser(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  req.user = null;

  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const id = Number(payload.sub);
    if (!id) return next();

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, login: true, role: true },
    });
    req.user = user;
  } catch {
    req.user = null;
  }

  next();
}
