import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import fs from 'node:fs';
import { pool, bookSeat, charge } from './booking.js';

beforeEach(async () => { await pool.query(fs.readFileSync('schema.sql', 'utf8')); });
afterAll(async () => { await pool.end(); });

const count = async (sql) => (await pool.query(sql)).rows[0].n;

describe('business-logic invariants under concurrency', () => {
  it('books a seat (positive control)', async () => {
    expect(await bookSeat(1, 'alice')).toEqual({ ok: true });
    expect(await count('SELECT seats_left AS n FROM events WHERE id = 1')).toBe(4);
  });

  it('never oversells: 20 simultaneous requests for 5 seats → exactly 5 bookings', async () => {
    const results = await Promise.all(Array.from({ length: 20 }, (_, i) => bookSeat(1, `user-${i}`)));
    expect(results.filter((r) => r.ok)).toHaveLength(5);
    expect(await count('SELECT count(*)::int AS n FROM bookings')).toBe(5);
    expect(await count('SELECT seats_left AS n FROM events WHERE id = 1')).toBe(0);
  });

  it('one user firing 5 simultaneous requests gets one booking, and seats are not lost', async () => {
    const results = await Promise.all(Array.from({ length: 5 }, () => bookSeat(1, 'alice')));
    expect(results.filter((r) => r.ok)).toHaveLength(1);
    expect(await count('SELECT seats_left AS n FROM events WHERE id = 1')).toBe(4);
  });

  it('charges once for a retried payment with the same idempotency key', async () => {
    const results = await Promise.all(Array.from({ length: 5 }, () => charge('alice', 2500, 'order-42-attempt')));
    expect(results.filter((r) => r.charged)).toHaveLength(1);
    expect(await count('SELECT count(*)::int AS n FROM payments')).toBe(1);
  });

  it('rejects a negative amount at the database level', async () => {
    await expect(charge('alice', -100, 'refund-trick')).rejects.toThrow();
  });
});
