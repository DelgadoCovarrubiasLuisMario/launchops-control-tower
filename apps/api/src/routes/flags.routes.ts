import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { FeatureFlag } from '../models/database.js';
import { writeAuditEvent } from '../utils/audit.js';

export const flagsRouter = Router();

flagsRouter.use(requireAuth);

const flagSchema = z.object({
  key: z.string().min(3).regex(/^[a-z0-9_]+$/),
  name: z.string().min(3),
  description: z.string().min(10),
  environment: z.enum(['staging', 'production']),
  rollout: z.number().min(0).max(100),
  enabled: z.boolean(),
  owner: z.string().min(2)
});

flagsRouter.get('/', async (req, res, next) => {
  try {
    const flags = await FeatureFlag.findAll({
      where: { organizationId: req.user!.organizationId },
      order: [['environment', 'ASC'], ['key', 'ASC']]
    });
    return res.json(flags);
  } catch (error) {
    return next(error);
  }
});

flagsRouter.post('/', requireRole(['admin', 'engineer']), async (req, res, next) => {
  try {
    const body = flagSchema.parse(req.body);
    const flag = await FeatureFlag.create({ ...body, organizationId: req.user!.organizationId });

    await writeAuditEvent({
      actor: req.user!.email,
      action: 'created feature flag',
      target: flag.key,
      organizationId: req.user!.organizationId,
      metadata: { environment: flag.environment, rollout: flag.rollout }
    });

    return res.status(201).json(flag);
  } catch (error) {
    return next(error);
  }
});

flagsRouter.patch('/:id/toggle', requireRole(['admin', 'engineer']), async (req, res, next) => {
  try {
    const flag = await FeatureFlag.findOne({ where: { id: req.params.id, organizationId: req.user!.organizationId } });

    if (!flag) {
      return res.status(404).json({ message: 'Feature flag not found' });
    }

    flag.enabled = !flag.enabled;
    await flag.save();

    await writeAuditEvent({
      actor: req.user!.email,
      action: flag.enabled ? 'enabled feature flag' : 'disabled feature flag',
      target: flag.key,
      organizationId: req.user!.organizationId,
      severity: flag.environment === 'production' ? 'warning' : 'info'
    });

    return res.json(flag);
  } catch (error) {
    return next(error);
  }
});
