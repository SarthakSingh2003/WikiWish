import { Router, Request, Response } from 'express';
import authRoutes from './auth';
import wishRoutes from './wishes';
import userRoutes from './users';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/wishes', wishRoutes);
router.use('/users', userRoutes);

// API health check
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'wikiwish-api' });
});

export default router;
