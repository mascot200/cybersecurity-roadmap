import pg from 'pg';
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgresql://api_app:api_app_pw@127.0.0.1:5432/authz_lab',
});

// Run fn inside a transaction with the caller's tenant set for Row-Level Security.
export async function withTenant(tenantId, fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.tenant_id', $1, true)", [tenantId]);  // true = local to this tx
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
