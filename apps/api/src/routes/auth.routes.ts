import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { User } from '../models/database.js';
import { signAccessToken } from '../utils/tokens.js';
import { writeAuditEvent } from '../utils/audit.js';

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await User.findOne({ where: { email: body.email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const matches = await bcrypt.compare(body.password, user.passwordHash);
    if (!matches) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId
    };

    await writeAuditEvent({
      actor: user.email,
      action: 'signed in',
      target: 'LaunchOps Control Tower',
      organizationId: user.organizationId,
      metadata: { role: user.role }
    });

    return res.json({ token: signAccessToken(payload), user: payload });
  } catch (error) {
    return next(error);
  }
});
