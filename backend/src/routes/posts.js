import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

// GET /api/boards/:slug/posts — все посты доски
router.get('/boards/:slug/posts', async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { board: { slug: req.params.slug } },
    include: { comments: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(posts);
});

// POST /api/boards/:slug/posts — создать пост (анонимно, authorHash передаётся с фронта)
router.post('/boards/:slug/posts', async (req, res) => {
  const board = await prisma.board.findUnique({ where: { slug: req.params.slug } });
  if (!board) return res.status(404).json({ error: 'Board not found' });

  const { title, body, imageUrl, authorHash } = req.body;
  const post = await prisma.post.create({
    data: { title, body, imageUrl, authorHash, boardId: board.id },
  });
  res.status(201).json(post);
});

// POST /api/posts/:id/vote — голосование { value: 1 | -1 }
router.post('/posts/:id/vote', async (req, res) => {
  const { value } = req.body;
  const id = Number(req.params.id);
  const post = await prisma.post.update({
    where: { id },
    data: value > 0 ? { upvotes: { increment: 1 } } : { downvotes: { increment: 1 } },
  });
  res.json(post);
});

// POST /api/posts/:id/comments — добавить комментарий
router.post('/posts/:id/comments', async (req, res) => {
  const postId = Number(req.params.id);
  const { body, authorHash } = req.body;
  const comment = await prisma.comment.create({ data: { body, authorHash, postId } });
  res.status(201).json(comment);
});

// DELETE /api/posts/:id — удалить пост (для модератора, auth добавите позже)
router.delete('/posts/:id', async (req, res) => {
  const id = Number(req.params.id);
  await prisma.post.delete({ where: { id } });
  res.status(204).send();
});

export default router;
