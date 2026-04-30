import express from 'express';
import morgan from 'morgan';
import familyRoutes from './routes/familyRoutes';
import questRoutes from './routes/questRoutes';
import rewardRoutes from './routes/rewardRoutes';
import authRoutes from './routes/authRoutes';
import inviteRoutes from './routes/inviteRoutes';
import logger from './utils/logger';

const app = express();

const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }
);

app.use(morganMiddleware);
app.use(express.json());

// Disable caching on all API responses so browsers always get fresh Firestore data
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.set('Pragma', 'no-cache');
  next();
});

// API Routes
app.use('/api/family', familyRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/invites', inviteRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', monolith: true });
});

export default app;
