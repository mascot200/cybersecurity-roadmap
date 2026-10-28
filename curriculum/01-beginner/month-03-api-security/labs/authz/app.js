import express from 'express';
import { withTenant } from './db.js';
import { authenticate } from './auth.js';

export const app = express();
app.use(express.json({ limit: '10kb' }));
app.use(authenticate);

// Authorization policy, in one place:
//   admin  → any invoice in their tenant; may delete
//   member → only invoices they own; may not delete
function scope(user) {
  return user.role === 'admin'
    ? { sql: 'tenant_id = $T', params: [user.tenant_id] }
    : { sql: 'tenant_id = $T AND owner_id = $O', params: [user.tenant_id, user.id] };
}

// Build "WHERE id = $1 AND <scope>" with correctly numbered placeholders.
function scoped(user, firstParams) {
  const s = scope(user);
  let n = firstParams.length;
  const sql = s.sql.replace('$T', () => `$${++n}`).replace('$O', () => `$${++n}`);
  return { where: sql, params: [...firstParams, ...s.params] };
}

const STATUSES = new Set(['draft', 'sent', 'paid']);
const parseId = (raw) => (/^\d{1,18}$/.test(raw) ? raw : null);

app.get('/invoices/:id', async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).end();
    const { where, params } = scoped(req.user, [id]);
    const rows = await withTenant(req.user.tenant_id, async (db) =>
      (await db.query(`SELECT * FROM invoices WHERE id = $1 AND ${where}`, params)).rows);
    rows.length ? res.json(rows[0]) : res.status(404).end();     // 404, not 403: don't confirm it exists
  } catch (e) { next(e); }
});

app.patch('/invoices/:id', async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id || !STATUSES.has(req.body?.status)) return res.status(400).json({ error: 'Invalid request' });
    const { where, params } = scoped(req.user, [req.body.status, id]);
    const rows = await withTenant(req.user.tenant_id, async (db) =>
      (await db.query(`UPDATE invoices SET status = $1 WHERE id = $2 AND ${where} RETURNING *`, params)).rows);
    rows.length ? res.json(rows[0]) : res.status(404).end();
  } catch (e) { next(e); }
});

app.delete('/invoices/:id', async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });   // function-level check
    const id = parseId(req.params.id);
    if (!id) return res.status(404).end();
    const { where, params } = scoped(req.user, [id]);
    const count = await withTenant(req.user.tenant_id, async (db) =>
      (await db.query(`DELETE FROM invoices WHERE id = $1 AND ${where}`, params)).rowCount);
    res.status(count ? 204 : 404).end();
  } catch (e) { next(e); }
});

app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'Internal error' }); });
