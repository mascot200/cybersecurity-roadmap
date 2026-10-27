import pg from 'pg';
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgresql://postgres:labpass@127.0.0.1:5432/booking_lab',
  max: 20,
});

// Reserve a seat. The check and the decrement are ONE atomic statement,
// so concurrent requests can't both see "1 seat left".
export async function bookSeat(eventId, userId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const dec = await client.query(
      'UPDATE events SET seats_left = seats_left - 1 WHERE id = $1 AND seats_left > 0 RETURNING seats_left',
      [eventId]);
    if (dec.rowCount === 0) { await client.query('ROLLBACK'); return { ok: false, reason: 'sold_out' }; }
    await client.query('INSERT INTO bookings (event_id, user_id) VALUES ($1, $2)', [eventId, userId]);
    await client.query('COMMIT');
    return { ok: true };
  } catch (e) {
    await client.query('ROLLBACK');
    if (e.code === '23505') return { ok: false, reason: 'already_booked' };   // unique violation → seat restored by rollback
    throw e;
  } finally {
    client.release();
  }
}

// Charge once per idempotency key, even if the client retries or double-clicks.
export async function charge(userId, amountCents, idempotencyKey) {
  const { rows } = await pool.query(
    `INSERT INTO payments (user_id, amount_cents, idempotency_key) VALUES ($1, $2, $3)
     ON CONFLICT (idempotency_key) DO NOTHING RETURNING id`,
    [userId, amountCents, idempotencyKey]);
  return rows.length ? { charged: true, id: rows[0].id } : { charged: false, reason: 'duplicate' };
}
