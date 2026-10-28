// Test cases for express-security.yaml. Run: semgrep --test .
// "ruleid" lines MUST be flagged by the named rule; "ok" lines must NOT be.

// --- sql-built-from-template-literal ---
// ruleid: sql-built-from-template-literal
pool.query(`SELECT * FROM users WHERE email = '${email}'`);
// ruleid: sql-built-from-template-literal
db.query("SELECT * FROM orders WHERE id = " + id);
// ok: sql-built-from-template-literal
pool.query('SELECT * FROM users WHERE email = $1', [email]);
// ok: sql-built-from-template-literal
pool.query(`SELECT * FROM products ORDER BY name`);

// --- request-body-assigned-to-model ---
// ruleid: request-body-assigned-to-model
Object.assign(user, req.body);
// ok: request-body-assigned-to-model
Object.assign(user, parsed.data);

// --- jwt-decoded-without-verification ---
// ruleid: jwt-decoded-without-verification
const claims = jwt.decode(token);
// ok: jwt-decoded-without-verification
const verified = jwt.verify(token, publicKey, { algorithms: ['ES256'], audience: 'invoices-api' });

// --- session-cookie-without-httponly ---
// ruleid: session-cookie-without-httponly
res.cookie('sid', sid, { secure: true, sameSite: 'lax' });
// ok: session-cookie-without-httponly
res.cookie('sid', sid, { httpOnly: true, secure: true, sameSite: 'lax' });

// --- cors-allows-any-origin-with-credentials ---
// ruleid: cors-allows-any-origin-with-credentials
app.use(cors({ origin: true, credentials: true }));
// ok: cors-allows-any-origin-with-credentials
app.use(cors({ origin: ['https://app.example.com'], credentials: true }));

// --- shell-command-from-template-literal ---
// ruleid: shell-command-from-template-literal
exec(`convert ${filename} out.png`);
// ok: shell-command-from-template-literal
execFile('convert', [filename, 'out.png']);
