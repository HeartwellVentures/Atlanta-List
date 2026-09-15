/*
  # Bound the size and shape of submitted quote requests

  1. Changes
  - Adds length CHECK constraints to `inquiries` so a caller cannot store
    oversized values through the public insert path.
  - Adds a basic email shape check.
  2. Security
  - Limits storage abuse and junk submissions through the Data API.
  - Limits are far above what the quote form allows, so real submissions pass.
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inquiries_name_length') THEN
    ALTER TABLE inquiries ADD CONSTRAINT inquiries_name_length
      CHECK (char_length(name) BETWEEN 1 AND 120);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inquiries_email_valid') THEN
    ALTER TABLE inquiries ADD CONSTRAINT inquiries_email_valid
      CHECK (char_length(email) BETWEEN 3 AND 200 AND email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inquiries_phone_length') THEN
    ALTER TABLE inquiries ADD CONSTRAINT inquiries_phone_length
      CHECK (phone IS NULL OR char_length(phone) <= 40);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inquiries_message_length') THEN
    ALTER TABLE inquiries ADD CONSTRAINT inquiries_message_length
      CHECK (char_length(message) BETWEEN 1 AND 5000);
  END IF;
END $$;
