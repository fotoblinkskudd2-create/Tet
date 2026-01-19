import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { pool, closeDatabase } from './db';
import { initPinecone } from './services/rag';

// Import routes
import authRoutes from './routes/auth';
import deceasedRoutes from './routes/deceased';
import chatRoutes from './routes/chat';

const app = express();

// Middleware
app.use(cors({
  origin: config.nodeEnv === 'production'
    ? ['https://graveai.no', 'https://www.graveai.no']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: config.nodeEnv,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/deceased', deceasedRoutes);
app.use('/api/chat', chatRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: config.nodeEnv === 'production'
      ? 'Internal server error'
      : err.message,
  });
});

// Initialize services and start server
async function start() {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected');

    // Initialize Pinecone
    if (config.pinecone.apiKey) {
      try {
        await initPinecone();
        console.log('✅ Pinecone initialized');
      } catch (error) {
        console.warn('⚠️  Pinecone initialization failed, continuing without it:', error);
      }
    } else {
      console.warn('⚠️  Pinecone API key not set, vector search will use PostgreSQL fallback');
    }

    // Start server
    app.listen(config.port, () => {
      console.log(`
🚀 GraveAI Backend Server

Environment: ${config.nodeEnv}
Port: ${config.port}
API: http://localhost:${config.port}/api

Ready to simulate the dead.
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});

start();
