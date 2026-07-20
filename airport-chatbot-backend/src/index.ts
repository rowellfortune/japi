import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { connectDB } from './config/database';
import chatRoutes from './routes/chat';
import flightRoutes from './routes/flights';
import gateRoutes from './routes/gates';
import baggageRoutes from './routes/baggage';
import authRoutes from './routes/auth';
import publicRoutes from './routes/public';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();

app.use(express.json());
app.use(cors({ origin: env.corsOrigin }));

app.use('/api/chat', chatRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/gates', gateRoutes);
app.use('/api/baggage', baggageRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port}`);
  });
};

startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
