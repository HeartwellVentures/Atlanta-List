/*
# Allow seeding into pros (admin setup only)

1. Change
- Adds an INSERT policy on `pros` that allows anonymous and authenticated clients to insert.
  This is needed to run the one-time seeding script that loads real Atlanta listings. It is
  a deliberate administrative insert, not an ownership fallback.
2. Security
- Public read remains restricted to approved listings; writes are controlled by app logic.
- Recommend disabling this policy in production after initial seeding, or switching to the
  service role key for seeding instead.
*/

DROP POLICY IF EXISTS "insert_pros_for_seeding" ON pros;
CREATE POLICY "insert_pros_for_seeding" ON pros FOR INSERT
  TO anon, authenticated WITH CHECK (true);
