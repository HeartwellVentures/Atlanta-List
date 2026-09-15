/*
  # Lock down public write access

  1. Changes
  - Drops the anon/authenticated INSERT, UPDATE and DELETE policies on `pros`
    (previously USING/WITH CHECK true), so listings can no longer be created,
    edited or deleted through the public Data API.
  - Drops the unused anon INSERT policy on `memberships`.
  - Revokes the matching table privileges from `anon` and `authenticated`.
  2. Security
  - Public SELECT on approved listings is unchanged.
  - Public INSERT on `inquiries` (the quote form) is unchanged.
  - Administrative writes now run server-side with the service role key.
*/

DROP POLICY IF EXISTS "insert_pros_for_seeding" ON pros;
DROP POLICY IF EXISTS "update_pros_admin" ON pros;
DROP POLICY IF EXISTS "delete_pros_admin" ON pros;
DROP POLICY IF EXISTS "public_insert_memberships" ON memberships;

REVOKE INSERT, UPDATE, DELETE ON pros FROM anon, authenticated;
REVOKE SELECT, INSERT, UPDATE, DELETE ON memberships FROM anon, authenticated;
REVOKE SELECT, UPDATE, DELETE ON inquiries FROM anon, authenticated;
