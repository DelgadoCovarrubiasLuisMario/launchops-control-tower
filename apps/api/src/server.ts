import http from 'node:http';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.js';
import { connectDatabase } from './models/database.js';
import { createRealtimeServer } from './realtime/socket.js';
import { apiRouter } from './routes/index.js';

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(pinoHttp());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 250,
    standardHeaders: 'draft-8',
    legacyHeaders: false
  })
);

app.use('/api', apiRouter);
app.use(errorHandler);

async function bootstrap() {
  await connectDatabase();
  createRealtimeServer(server);

  server.listen(env.PORT, () => {
    console.log(`LaunchOps API running on http://localhost:${env.PORT}`);
  });
}

void bootstrap();
