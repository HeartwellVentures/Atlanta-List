/*
# Admin password table

## Purpose
Stores the admin password hash in the database so the admin edge function
can verify it without relying on a Supabase dashboard-managed secret.
This is needed because the project owner cannot access the Supabase dashboard
to set edge function secrets manually.

## New Tables
- `admin_settings`
  - `key` (text, primary key) — settings key, currently only 'admin_password'
  - `value` (text, not null) — the SHA-256 hash of the admin password
  - `updated_at` (timestamptz, default now())

## Security
- RLS enabled on `admin_settings`.
- No policies for anon or authenticated roles — the table is completely
  locked down. Only the service role key (used inside edge functions) can
  read or write it. This prevents the password hash from being exposed
  through the anon-key client.

## Default password
- Inserts a row with key='admin_password' containing the SHA-256 hash of
  'TradeDirectory2026!' as the default admin password. The user should
  change this after first login.
*/

CREATE TABLE IF NOT EXISTS admin_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO admin_settings (key, value)
VALUES ('admin_password', '9b9044403cfb671568a443b4272acd29797a106e9ba8332e545bd9a4ca4db6f1')
ON CONFLICT (key) DO NOTHING;
