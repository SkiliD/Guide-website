import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './config/db';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import guideRoutes from './routes/guides';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || '*';

// Middleware
app.use(
  cors({
    origin: FRONTEND_URL === '*' ? true : FRONTEND_URL,
  })
);
app.use(express.json());

// Routes de test
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Guide API is running',
    defaultCredentials: {
      admin: { email: 'admin@henri.trip', password: 'admin123' },
      user: { email: 'user@henri.trip', password: 'user123' },
    },
    endpoints: {
      health: '/health',
      login: 'POST /auth/login',
      me: 'GET /auth/me',
      users: '/users (admin)',
      guides: '/guides',
    },
  });
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/guides', guideRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: `Route introuvable: ${req.method} ${req.path}` });
});

// Initialize database then start server
async function start() {
  try {
    await initDb();
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log('Admin demo: admin@henri.trip / admin123');
    console.log('User demo : user@henri.trip / user123');
  });
}

start();

export default app;
