DROP TABLE IF EXISTS payments, bookings, events;
CREATE TABLE events (
  id int PRIMARY KEY,
  seats_left int NOT NULL CHECK (seats_left >= 0)          -- invariant enforced by the database
);
CREATE TABLE bookings (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id int NOT NULL REFERENCES events(id),
  user_id text NOT NULL,
  UNIQUE (event_id, user_id)                               -- one booking per user per event
);
CREATE TABLE payments (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id text NOT NULL,
  amount_cents int NOT NULL CHECK (amount_cents > 0),
  idempotency_key text NOT NULL UNIQUE                     -- a retried request can't charge twice
);
INSERT INTO events VALUES (1, 5);
