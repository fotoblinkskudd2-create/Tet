import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth';
import projectsRouter from './routes/projects';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Byggeprosjekter API listening on port ${port}`);
});
