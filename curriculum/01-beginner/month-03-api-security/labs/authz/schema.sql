DROP TABLE IF EXISTS invoices, api_tokens, users, tenants CASCADE;

CREATE TABLE tenants (id uuid PRIMARY KEY, name text NOT NULL);
CREATE TABLE users (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'member'))
);
-- Lab-only auth: opaque tokens. Week 10 replaces this with JWT verification.
CREATE TABLE api_tokens (token text PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id));
CREATE TABLE invoices (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,      -- sequential on purpose: easy to guess
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  owner_id uuid NOT NULL REFERENCES users(id),
  amount_cents int NOT NULL,
  status text NOT NULL DEFAULT 'draft'
);

INSERT INTO tenants VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Acme'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'Globex');
INSERT INTO users VALUES
  ('aaaaaaaa-1111-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'alice@acme.test', 'admin'),
  ('aaaaaaaa-1111-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'bob@acme.test',   'member'),
  ('bbbbbbbb-1111-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000002', 'carol@globex.test', 'admin');
INSERT INTO api_tokens VALUES
  ('tok-alice', 'aaaaaaaa-1111-0000-0000-000000000001'),
  ('tok-bob',   'aaaaaaaa-1111-0000-0000-000000000002'),
  ('tok-carol', 'bbbbbbbb-1111-0000-0000-000000000003');
INSERT INTO invoices (tenant_id, owner_id, amount_cents) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'aaaaaaaa-1111-0000-0000-000000000001', 1000),  -- id 1: Acme, alice
  ('aaaaaaaa-0000-0000-0000-000000000001', 'aaaaaaaa-1111-0000-0000-000000000002', 2000),  -- id 2: Acme, bob
  ('bbbbbbbb-0000-0000-0000-000000000002', 'bbbbbbbb-1111-0000-0000-000000000003', 3000);  -- id 3: Globex, carol

-- Defense in depth: Row-Level Security. The app connects as api_app (not the table owner),
-- and every request sets app.tenant_id inside its transaction.
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'api_app') THEN
    CREATE ROLE api_app LOGIN PASSWORD 'api_app_pw';
  END IF;
END $$;
GRANT SELECT ON tenants, users, api_tokens TO api_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON invoices TO api_app;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON invoices
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);
