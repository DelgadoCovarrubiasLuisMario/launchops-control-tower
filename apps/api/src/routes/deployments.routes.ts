import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Deployment } from '../models/database.js';
import { writeAuditEvent } from '../utils/audit.js';

export const deploymentsRouter = Router();

deploymentsRouter.use(requireAuth);

const deploymentSchema = z.object({
  service: z.string().min(2),
  version: z.string().min(2),
  environment: z.enum(['staging', 'production']),
  commitSha: z.string().min(7).max(12),
  owner: z.string().min(2)
});

deploymentsRouter.get('/', async (req, res, next) => {
  try {
    const deployments = await Deployment.findAll({
      where: { organizationId: req.user!.organizationId },
      order: [['createdAt', 'DESC']]
    });
    return res.json(deployments);
  } catch (error) {
    return next(error);
  }
});

deploymentsRouter.post('/', requireRole(['admin', 'engineer']), async (req, res, next) => {
  try {
    const body = deploymentSchema.parse(req.body);
    const deployment = await Deployment.create({
      ...body,
      status: 'queued',
      durationMs: 0,
      organizationId: req.user!.organizationId
    });

    await writeAuditEvent({
      actor: req.user!.email,
      action: 'queued deployment',
      target: `${deployment.service}@${deployment.version}`,
      organizationId: req.user!.organizationId,
      severity: body.environment === 'production' ? 'warning' : 'info',
      metadata: { environment: body.environment, commitSha: body.commitSha }
    });

    return res.status(201).json(deployment);
  } catch (error) {
    return next(error);
  }
});

deploymentsRouter.patch('/:id/status', requireRole(['admin', 'engineer']), async (req, res, next) => {
  try {
    const statusSchema = z.object({ status: z.enum(['queued', 'running', 'success', 'failed', 'rolled_back']) });
    const { status } = statusSchema.parse(req.body);
    const deployment = await Deployment.findOne({ where: { id: req.params.id, organizationId: req.user!.organizationId } });

    if (!deployment) {
      return res.status(404).json({ message: 'Deployment not found' });
    }

    deployment.status = status;
    deployment.durationMs = status === 'success' || status === 'failed' ? Math.floor(Math.random() * 420000) + 30000 : deployment.durationMs;
    await deployment.save();

    await writeAuditEvent({
      actor: req.user!.email,
      action: `changed deployment status to ${status}`,
      target: `${deployment.service}@${deployment.version}`,
      organizationId: req.user!.organizationId,
      severity: status === 'failed' || status === 'rolled_back' ? 'danger' : 'info'
    });

    return res.json(deployment);
  } catch (error) {
    return next(error);
  }
});
