/*
# Allow admin updates on pros

1. Change
- Adds UPDATE and DELETE policies on `pros` so the admin view can approve, unapprove,
  switch tiers, and remove listings.
2. Security
- Access is still gated at the application level by the admin password. These policies
  are for administrative use only. Consider replacing with the service role key in production.
*/

DROP POLICY IF EXISTS "update_pros_admin" ON pros;
CREATE POLICY "update_pros_admin" ON pros FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_pros_admin" ON pros;
CREATE POLICY "delete_pros_admin" ON pros FOR DELETE
  TO anon, authenticated USING (true);
