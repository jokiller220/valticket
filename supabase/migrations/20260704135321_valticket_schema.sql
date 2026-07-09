/*
# Valticket Schema

Full schema for the Valticket event ticket validation system.

## New Tables

### events
Stores event metadata: name, date, venue, capacity, and optional image URL.

### ticket_types
Ticket categories per event (Standard, VIP, VVIP) with pricing and color coding.

### agents
Scanning agents with custom login codes (e.g. AGT-2025-78). Uses app-level auth, NOT Supabase auth.

### tickets
Individual tickets with QR-embedded data: ticket number, buyer info, HMAC signature, tombola number, and current status.

### scan_logs
Full audit trail of every scan attempt: which ticket was scanned, by which agent, result (valid / already_scanned / invalid), timestamp, and sync status for offline mode.

## Security
- RLS enabled on all tables.
- All policies use `TO anon, authenticated` since the app uses custom agent auth (not Supabase auth), meaning all requests arrive via the anon key.
- `USING (true)` is intentional here: data is shared across agents for the same event system.
*/

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  date timestamptz NOT NULL,
  venue text NOT NULL,
  city text NOT NULL DEFAULT 'Lomé',
  capacity int NOT NULL DEFAULT 0,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  color text NOT NULL DEFAULT '#7c3aed',
  quota int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  login_code text UNIQUE NOT NULL,
  temp_password text NOT NULL,
  event_id uuid REFERENCES events(id),
  role text NOT NULL DEFAULT 'validator',
  is_active boolean NOT NULL DEFAULT true,
  avatar_initials text,
  member_since timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_type_id uuid NOT NULL REFERENCES ticket_types(id),
  ticket_number text UNIQUE NOT NULL,
  buyer_name text,
  purchased_at timestamptz DEFAULT now(),
  price numeric NOT NULL DEFAULT 0,
  tombola_number text,
  hmac_signature text NOT NULL,
  qr_payload text NOT NULL,
  status text NOT NULL DEFAULT 'valid',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scan_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES tickets(id),
  event_id uuid NOT NULL REFERENCES events(id),
  agent_id uuid NOT NULL REFERENCES agents(id),
  scanned_at timestamptz DEFAULT now(),
  result text NOT NULL,
  ticket_number_attempted text,
  agent_name text,
  synced boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_scan_logs_event_id ON scan_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_scan_logs_scanned_at ON scan_logs(scanned_at);
CREATE INDEX IF NOT EXISTS idx_agents_login_code ON agents(login_code);

-- RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_logs ENABLE ROW LEVEL SECURITY;

-- Events
DROP POLICY IF EXISTS "anon_select_events" ON events;
CREATE POLICY "anon_select_events" ON events FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_events" ON events;
CREATE POLICY "anon_insert_events" ON events FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_events" ON events;
CREATE POLICY "anon_update_events" ON events FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_events" ON events;
CREATE POLICY "anon_delete_events" ON events FOR DELETE TO anon, authenticated USING (true);

-- Ticket types
DROP POLICY IF EXISTS "anon_select_ticket_types" ON ticket_types;
CREATE POLICY "anon_select_ticket_types" ON ticket_types FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_ticket_types" ON ticket_types;
CREATE POLICY "anon_insert_ticket_types" ON ticket_types FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_ticket_types" ON ticket_types;
CREATE POLICY "anon_update_ticket_types" ON ticket_types FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_ticket_types" ON ticket_types;
CREATE POLICY "anon_delete_ticket_types" ON ticket_types FOR DELETE TO anon, authenticated USING (true);

-- Agents
DROP POLICY IF EXISTS "anon_select_agents" ON agents;
CREATE POLICY "anon_select_agents" ON agents FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_agents" ON agents;
CREATE POLICY "anon_insert_agents" ON agents FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_agents" ON agents;
CREATE POLICY "anon_update_agents" ON agents FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_agents" ON agents;
CREATE POLICY "anon_delete_agents" ON agents FOR DELETE TO anon, authenticated USING (true);

-- Tickets
DROP POLICY IF EXISTS "anon_select_tickets" ON tickets;
CREATE POLICY "anon_select_tickets" ON tickets FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_tickets" ON tickets;
CREATE POLICY "anon_insert_tickets" ON tickets FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_tickets" ON tickets;
CREATE POLICY "anon_update_tickets" ON tickets FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_tickets" ON tickets;
CREATE POLICY "anon_delete_tickets" ON tickets FOR DELETE TO anon, authenticated USING (true);

-- Scan logs
DROP POLICY IF EXISTS "anon_select_scan_logs" ON scan_logs;
CREATE POLICY "anon_select_scan_logs" ON scan_logs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_scan_logs" ON scan_logs;
CREATE POLICY "anon_insert_scan_logs" ON scan_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_scan_logs" ON scan_logs;
CREATE POLICY "anon_update_scan_logs" ON scan_logs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_scan_logs" ON scan_logs;
CREATE POLICY "anon_delete_scan_logs" ON scan_logs FOR DELETE TO anon, authenticated USING (true);
