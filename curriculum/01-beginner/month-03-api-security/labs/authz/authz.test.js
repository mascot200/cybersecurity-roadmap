import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import fs from 'node:fs';
import pg from 'pg';
import { pool, withTenant } from './db.js';

import { app } from './app.js';
const admin = new pg.Client({ connectionString: process.env.ADMIN_DATABASE_URL });

beforeEach(async () => {
  await admin.connect().catch(() => {});                 // connect once; ignore "already connected"
  await admin.query(fs.readFileSync('schema.sql', 'utf8'));
});
afterAll(async () => { await pool.end(); await admin.end(); });

const as = (token) => ({ Authorization: `Bearer ${token}` });
const ALICE = as('tok-alice');   // Acme admin   — owns invoice 1
const BOB   = as('tok-bob');     // Acme member  — owns invoice 2
const CAROL = as('tok-carol');   // Globex admin — owns invoice 3

describe('authorization', () => {
  it('requires authentication', async () => {
    expect((await request(app).get('/invoices/1')).status).toBe(401);
  });

  it('lets an admin read invoices in their own tenant (positive control)', async () => {
    const res = await request(app).get('/invoices/2').set(ALICE);
    expect(res.status).toBe(200);
    expect(res.body.amount_cents).toBe(2000);
  });

  it('blocks cross-tenant reads (BOLA/IDOR)', async () => {
    expect((await request(app).get('/invoices/3').set(ALICE)).status).toBe(404);
  });

  it('blocks cross-tenant updates', async () => {
    const res = await request(app).patch('/invoices/1').set(CAROL).send({ status: 'paid' });
    expect(res.status).toBe(404);
    const after = await admin.query('SELECT status FROM invoices WHERE id = 1');
    expect(after.rows[0].status).toBe('draft');
  });

  it("blocks a member from reading a colleague's invoice", async () => {
    expect((await request(app).get('/invoices/1').set(BOB)).status).toBe(404);
  });

  it('blocks members from deleting (function-level authorization)', async () => {
    expect((await request(app).delete('/invoices/2').set(BOB)).status).toBe(403);
  });

  it('blocks cross-tenant deletes', async () => {
    await request(app).delete('/invoices/1').set(CAROL);
    const after = await admin.query('SELECT count(*)::int AS n FROM invoices WHERE id = 1');
    expect(after.rows[0].n).toBe(1);
  });
});

describe('row-level security safety net', () => {
  it('hides other tenants even if a query forgets the tenant filter', async () => {
    const rows = await withTenant('aaaaaaaa-0000-0000-0000-000000000001', async (db) =>
      (await db.query('SELECT id FROM invoices ORDER BY id')).rows);      // no WHERE on purpose
    expect(rows.map((r) => Number(r.id))).toEqual([1, 2]);
  });

  it('returns nothing when no tenant is set', async () => {
    const { rows } = await pool.query('SELECT id FROM invoices');
    expect(rows).toEqual([]);
  });
});
