// Table-driven authorization matrix: one row per (caller, method, invoice) with the expected status.
// Adding an endpoint or role means adding rows here, not writing new test logic.
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import fs from 'node:fs';
import pg from 'pg';
import { pool } from './db.js';
import { app } from './app.js';

const admin = new pg.Client({ connectionString: process.env.ADMIN_DATABASE_URL });
beforeEach(async () => {
  await admin.connect().catch(() => {});
  await admin.query(fs.readFileSync('schema.sql', 'utf8'));
});
afterAll(async () => { await pool.end(); await admin.end(); });

// Invoice 1: Acme, owned by alice · 2: Acme, owned by bob · 3: Globex, owned by carol
const CALLERS = {
  'alice (Acme admin)': 'tok-alice',
  'bob (Acme member)': 'tok-bob',
  'carol (Globex admin)': 'tok-carol',
  'anonymous': null,
};

const MATRIX = [
  // caller,                 method,   id, expected
  ['alice (Acme admin)',     'get',    1,  200],
  ['alice (Acme admin)',     'get',    2,  200],
  ['alice (Acme admin)',     'get',    3,  404],
  ['bob (Acme member)',      'get',    1,  404],
  ['bob (Acme member)',      'get',    2,  200],
  ['bob (Acme member)',      'get',    3,  404],
  ['carol (Globex admin)',   'get',    1,  404],
  ['carol (Globex admin)',   'get',    3,  200],
  ['anonymous',              'get',    1,  401],
  ['alice (Acme admin)',     'patch',  2,  200],
  ['alice (Acme admin)',     'patch',  3,  404],
  ['bob (Acme member)',      'patch',  1,  404],
  ['bob (Acme member)',      'patch',  2,  200],
  ['carol (Globex admin)',   'patch',  1,  404],
  ['alice (Acme admin)',     'delete', 2,  204],
  ['alice (Acme admin)',     'delete', 3,  404],
  ['bob (Acme member)',      'delete', 2,  403],
  ['carol (Globex admin)',   'delete', 1,  404],
  ['anonymous',              'delete', 1,  401],
];

describe('authorization matrix', () => {
  it.each(MATRIX)('%s %s /invoices/%i → %i', async (caller, method, id, expected) => {
    const token = CALLERS[caller];
    let req = request(app)[method](`/invoices/${id}`);
    if (token) req = req.set('Authorization', `Bearer ${token}`);
    if (method === 'patch') req = req.send({ status: 'sent' });
    const before = (await admin.query('SELECT status FROM invoices WHERE id = $1', [id])).rows[0];

    const res = await req;
    expect(res.status).toBe(expected);

    // For every denied write, the row must be unchanged.
    if (expected >= 400 && method !== 'get') {
      const after = (await admin.query('SELECT status FROM invoices WHERE id = $1', [id])).rows[0];
      expect(after).toEqual(before);
    }
  });
});
