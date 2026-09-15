/*
  # Restrict which inquiry columns the public can write

  1. Changes
  - Revokes the blanket INSERT grant on `inquiries` from anon/authenticated and
    re-grants it only on the columns the quote form legitimately sends.
  2. Security
  - `status` and `created_at` can no longer be set by the caller; they keep their
    server-side defaults.
  - The public INSERT policy is unchanged, so the quote form keeps working.
*/

REVOKE INSERT ON inquiries FROM anon, authenticated;
GRANT INSERT (pro_id, name, email, phone, message) ON inquiries TO anon, authenticated;
