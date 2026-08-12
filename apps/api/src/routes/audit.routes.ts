import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { AuditEvent } from '../models/database.js';

export const auditRouter = Router();

auditRouter.use(requireAuth);

auditRouter.get('/', requireRole(['admin', 'engineer']), async (req, res, next) => {
  try {
    const events = await AuditEvent.findAll({
      where: { organizationId: req.user!.organizationId },
      order: [['createdAt', 'DESC']],
      limit: 80
    });
    return res.json(events);
  } catch (error) {
    return next(error);
  }
});
