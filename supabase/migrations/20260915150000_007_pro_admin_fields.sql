/*
# Admin dashboard fields on pros

Adds the listing-completeness columns the admin dashboard edits:
- `photo_url` text nullable (listing photo)
- `description` text nullable (about the business)
- `license_number` text nullable (trade license number)

These were not in the original directory schema; the public pages ignore
them until content is filled in.
*/

ALTER TABLE pros ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE pros ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE pros ADD COLUMN IF NOT EXISTS license_number text;
