import { Router } from 'express';
import { Op } from 'sequelize';
import { Deployment, FeatureFlag, Incident, SystemMetric } from '../models/database.js';
import { requireAuth } from '../middleware/auth.js';

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dayLabel(date: Date) {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

async function buildReleaseRhythm(organizationId: number) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);

  const [deployments, incidents] = await Promise.all([
    Deployment.findAll({
      attributes: ['createdAt'],
      where: { organizationId, createdAt: { [Op.gte]: start } }
    }),
    Incident.findAll({
      attributes: ['createdAt'],
      where: { organizationId, createdAt: { [Op.gte]: start } }
    })
  ]);

  const deployMap = new Map<string, number>();
  const incidentMap = new Map<string, number>();

  for (const deployment of deployments) {
    const key = dayKey(new Date(deployment.createdAt));
    deployMap.set(key, (deployMap.get(key) ?? 0) + 1);
  }

  for (const incident of incidents) {
    const key = dayKey(new Date(incident.createdAt));
    incidentMap.set(key, (incidentMap.get(key) ?? 0) + 1);
  }

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = dayKey(date);
    return {
      day: dayLabel(date),
      deploys: deployMap.get(key) ?? 0,
      incidents: incidentMap.get(key) ?? 0
    };
  });
}

dashboardRouter.get('/overview', async (req, res, next) => {
  try {
    const organizationId = req.user!.organizationId;
    const [metrics, deployments, incidents, flags, releaseRhythm] = await Promise.all([
      SystemMetric.findAll({ where: { organizationId }, order: [['key', 'ASC']] }),
      Deployment.findAll({ where: { organizationId }, order: [['createdAt', 'DESC']], limit: 8 }),
      Incident.findAll({ where: { organizationId }, order: [['createdAt', 'DESC']], limit: 6 }),
      FeatureFlag.findAll({ where: { organizationId }, order: [['createdAt', 'DESC']], limit: 6 }),
      buildReleaseRhythm(organizationId)
    ]);

    const [success, failed, running, criticalIncidents] = await Promise.all([
      Deployment.count({ where: { organizationId, status: 'success' } }),
      Deployment.count({ where: { organizationId, status: 'failed' } }),
      Deployment.count({ where: { organizationId, status: 'running' } }),
      Incident.count({
        where: {
          organizationId,
          severity: { [Op.in]: ['high', 'critical'] },
          status: { [Op.ne]: 'resolved' }
        }
      })
    ]);

    return res.json({
      metrics,
      deployments,
      incidents,
      flags,
      releaseRhythm,
      summary: {
        deploymentSuccessRate: Math.round((success / Math.max(success + failed, 1)) * 100),
        runningDeployments: running,
        criticalIncidents,
        enabledFlags: flags.filter((flag) => flag.enabled).length
      }
    });
  } catch (error) {
    return next(error);
  }
});
