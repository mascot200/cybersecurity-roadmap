import { pool } from './db.js';

// Authentication: who is calling? (Week 10 swaps this for JWT verification.)
export async function authenticate(req, res, next) {
  try {
    const token = /^Bearer (.+)$/.exec(req.headers.authorization ?? '')?.[1];
    if (!token) return res.status(401).json({ error: 'Unauthenticated' });
    const { rows } = await pool.query(
      `SELECT u.id, u.tenant_id, u.role FROM api_tokens t JOIN users u ON u.id = t.user_id
       WHERE t.token = $1`, [token]);
    if (rows.length !== 1) return res.status(401).json({ error: 'Unauthenticated' });
    req.user = rows[0];
    next();
  } catch (e) { next(e); }
}
