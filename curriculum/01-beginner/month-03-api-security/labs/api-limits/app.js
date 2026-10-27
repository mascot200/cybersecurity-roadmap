import express from 'express';
import { z } from 'zod';
import { rateLimit } from 'express-rate-limit';

// Allowlist exactly what a user may change. .strict() rejects unknown keys (role, tenantId, id …).
const UpdateMe = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.string().email().max(254).optional(),
}).strict();

const ListQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).max(10_000).default(0),
});

const validate = (schema, where) => (req, res, next) => {
  const result = schema.safeParse(req[where] ?? {});
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid request', fields: result.error.issues.map((i) => i.path.join('.')) });
  }
  req.valid = result.data;
  next();
};

export function createApp() {
  const app = express();
  app.use(express.json({ limit: '10kb' }));                // reject oversized bodies early (413)
  const users = new Map([['u1', { id: 'u1', name: 'Bob', email: 'bob@acme.test', role: 'member', tenantId: 't1' }]]);
  const items = Array.from({ length: 5000 }, (_, i) => ({ id: i + 1, name: `item ${i + 1}` }));

  app.patch('/me', validate(UpdateMe, 'body'), (req, res) => {
    const me = users.get('u1');
    Object.assign(me, req.valid);                           // only validated, allowlisted fields
    const { id, name, email } = me;                         // response allowlist too: no internal fields
    res.json({ id, name, email });
  });

  app.get('/items', validate(ListQuery, 'query'), (req, res) => {
    const { limit, offset } = req.valid;
    res.json(items.slice(offset, offset + limit));
  });

  const reportLimiter = rateLimit({ windowMs: 60_000, limit: 5, standardHeaders: 'draft-7', legacyHeaders: false });
  app.post('/reports', reportLimiter, (req, res) => res.status(202).json({ queued: true }));

  app.use((err, req, res, next) => {
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Payload too large' });
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Malformed JSON' });
    res.status(500).json({ error: 'Internal error' });
  });
  return app;
}
