import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import scriptRoutes from './routes/scripts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scripts', scriptRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '✨ Tet backend is running!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✨ Server running on port ${PORT}`);
  console.log(`✨ API available at http://localhost:${PORT}/api`);
});

export default app;
