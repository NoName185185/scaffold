import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/boards — список всех досок
router.get('/', async (req, res) => {
  const boards = await prisma.board.findMany();
  res.json(boards);
});

// POST /api/boards — создать доску (для будущей админ-панели)
router.post('/', async (req, res) => {
  const { slug, title } = req.body;
  try {
    const board = await prisma.board.create({ data: { slug, title } });
    res.status(201).json(board);
  } catch (err) {
    res.status(400).json({ error: 'Board with this slug already exists' });
  }
});

export default router;
