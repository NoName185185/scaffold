import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { attachUser } from './middleware/attachUser.js';
import authRouter from './routes/auth.js';
import boardsRouter from './routes/boards.js';
import postsRouter from './routes/posts.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api', attachUser);
app.use('/api/auth', authRouter);
app.use('/api/boards', boardsRouter);
app.use('/api', postsRouter);

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
