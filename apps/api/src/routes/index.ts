import { Router } from 'express';
import { auditRouter } from './audit.routes.js';
import { authRouter } from './auth.routes.js';
import { dashboardRouter } from './dashboard.routes.js';
import { deploymentsRouter } from './deployments.routes.js';
import { flagsRouter } from './flags.routes.js';
import { incidentsRouter } from './incidents.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'launchops-api', timestamp: new Date().toISOString() });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/deployments', deploymentsRouter);
apiRouter.use('/incidents', incidentsRouter);
apiRouter.use('/flags', flagsRouter);
apiRouter.use('/audit', auditRouter);
