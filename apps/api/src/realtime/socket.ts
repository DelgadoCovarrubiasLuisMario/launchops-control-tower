import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { Deployment, Incident, SystemMetric } from '../models/database.js';
import { verifyAccessToken } from '../utils/tokens.js';

export function createRealtimeServer(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin: env.WEB_ORIGIN,
      methods: ['GET', 'POST', 'PATCH']
    }
  });

  io.use((socket, next) => {
    const token =
      typeof socket.handshake.auth?.token === 'string'
        ? socket.handshake.auth.token
        : typeof socket.handshake.headers.authorization === 'string' &&
            socket.handshake.headers.authorization.startsWith('Bearer ')
          ? socket.handshake.headers.authorization.slice(7)
          : undefined;

    if (!token) {
      return next(new Error('Unauthorized'));
    }

    try {
      const user = verifyAccessToken(token);
      socket.data.user = user;
      return next();
    } catch {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const organizationId = socket.data.user.organizationId as number;
    const room = `org:${organizationId}`;
    void socket.join(room);
    socket.emit('launchops:connected', {
      connected: true,
      at: new Date().toISOString(),
      organizationId
    });
  });

  const timer = setInterval(async () => {
    try {
      const orgIds = new Set<number>();
      for (const socket of io.sockets.sockets.values()) {
        const organizationId = socket.data.user?.organizationId as number | undefined;
        if (organizationId) {
          orgIds.add(organizationId);
        }
      }

      for (const organizationId of orgIds) {
        const [metrics, latestDeployment, latestIncident] = await Promise.all([
          SystemMetric.findAll({
            where: { organizationId },
            limit: 6,
            order: [['key', 'ASC']]
          }),
          Deployment.findOne({
            where: { organizationId },
            order: [['createdAt', 'DESC']]
          }),
          Incident.findOne({
            where: { organizationId },
            order: [['createdAt', 'DESC']]
          })
        ]);

        io.to(`org:${organizationId}`).emit('launchops:pulse', {
          at: new Date().toISOString(),
          metrics,
          latestDeployment,
          latestIncident
        });
      }
    } catch (error) {
      console.error('[realtime] pulse failed', error);
    }
  }, 5000);

  io.on('close', () => clearInterval(timer));

  return io;
}
