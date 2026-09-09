import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();
const LOGIN_RE = /^[a-zA-Z0-9._-]{3,32}$/;

function publicUser(user) {
  return { id: user.id, login: user.login, role: user.role };
}

function signToken(user) {
  return jwt.sign({ role: user.role }, process.env.JWT_SECRET, {
    subject: String(user.id),
    expiresIn: '7d',
  });
}

router.post('/register', async (req, res) => {
  const login = typeof req.body.login === 'string' ? req.body.login.trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!LOGIN_RE.test(login)) {
    return res.status(400).json({ error: 'Login must be 3–32 characters: letters, digits, . _ -' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { login, passwordHash, role: 'user' },
    });
    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  } catch {
    res.status(400).json({ error: 'Login already taken' });
  }
});

router.post('/login', async (req, res) => {
  const login = typeof req.body.login === 'string' ? req.body.login.trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  const user = await prisma.user.findUnique({ where: { login } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid login or password' });
  }

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

router.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});

export default router;
