import express from 'express';
import fs from 'node:fs';
import pg from 'pg';

// Secrets come from files mounted by Docker (/run/secrets/...), not from environment variables
// that show up in `docker inspect`, process listings and crash dumps.
const readSecret = (name) => fs.readFileSync(`/run/secrets/${name}`, 'utf8').trim();
const dbPassword = process.env.DB_PASSWORD_FILE
  ? fs.readFileSync(process.env.DB_PASSWORD_FILE, 'utf8').trim()
  : readSecret('db_password');

const pool = new pg.Pool({
  host: process.env.DB_HOST ?? 'db',
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER ?? 'app',
  database: process.env.DB_NAME ?? 'app',
  password: dbPassword,
  max: 5,
  statement_timeout: 2000,
});

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));

app.get('/healthz', (req, res) => res.json({ ok: true }));
app.get('/readyz', async (req, res) => {
  try { await pool.query('SELECT 1'); res.json({ db: 'ok' }); }
  catch { res.status(503).json({ db: 'unavailable' }); }       // no internal details in the response
});
app.get('/whoami', (req, res) => res.json({ uid: process.getuid(), gid: process.getgid() }));  // lab only: proves non-root

const port = Number(process.env.PORT ?? 3000);
const server = app.listen(port, '0.0.0.0', () => console.log(JSON.stringify({ msg: 'listening', port })));
process.on('SIGTERM', () => server.close(() => pool.end().then(() => process.exit(0))));
