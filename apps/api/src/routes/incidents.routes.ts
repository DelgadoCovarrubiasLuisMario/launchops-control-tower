import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Incident } from '../models/database.js';
import { writeAuditEvent } from '../utils/audit.js';

export const incidentsRouter = Router();

incidentsRouter.use(requireAuth);

const incidentSchema = z.object({
  title: z.string().min(6),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  service: z.string().min(2),
  summary: z.string().min(12)
});

incidentsRouter.get('/', async (req, res, next) => {
  try {
    const incidents = await Incident.findAll({
      where: { organizationId: req.user!.organizationId },
      order: [['createdAt', 'DESC']]
    });
    return res.json(incidents);
  } catch (error) {
    return next(error);
  }
});

incidentsRouter.post('/', requireRole(['admin', 'engineer']), async (req, res, next) => {
  try {
    const body = incidentSchema.parse(req.body);
    const incident = await Incident.create({
      ...body,
      status: 'open',
      organizationId: req.user!.organizationId
    });

    await writeAuditEvent({
      actor: req.user!.email,
      action: 'opened incident',
      target: incident.title,
      organizationId: req.user!.organizationId,
      severity: body.severity === 'critical' || body.severity === 'high' ? 'danger' : 'warning',
      metadata: { service: body.service, severity: body.severity }
    });

    return res.status(201).json(incident);
  } catch (error) {
    return next(error);
  }
});

incidentsRouter.patch('/:id/status', requireRole(['admin', 'engineer']), async (req, res, next) => {
  try {
    const statusSchema = z.object({ status: z.enum(['open', 'investigating', 'resolved']) });
    const { status } = statusSchema.parse(req.body);
    const incident = await Incident.findOne({ where: { id: req.params.id, organizationId: req.user!.organizationId } });

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    incident.status = status;
    await incident.save();

    await writeAuditEvent({
      actor: req.user!.email,
      action: `changed incident status to ${status}`,
      target: incident.title,
      organizationId: req.user!.organizationId,
      severity: status === 'resolved' ? 'info' : 'warning'
    });

    return res.json(incident);
  } catch (error) {
    return next(error);
  }
});
