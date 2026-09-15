/*
# The Atlanta List: directory, inquiries, and memberships

1. New Tables
- `pros` (directory listings of real Atlanta businesses)
  - `id` uuid primary key
  - `slug` text unique for clean URLs
  - `name` text
  - `trade_slug` text linking to the trade page
  - `trade_name` text for display
  - `phone` text public contact
  - `website` text optional
  - `address`, `city`, `state`, `zip` text
  - `neighborhoods` text[] (service areas)
  - `services` text[] (skills)
  - `hours` text
  - `rating` numeric (aggregate Google/Yelp rating)
  - `review_count` int
  - `review_url` text (link to Google/Yelp profile)
  - `tier` text: 'free', 'featured', 'premium'
  - `approved` boolean (admin-controlled visibility)
  - `created_at`, `updated_at` timestamptz
- `inquiries` (quote requests from homeowners)
  - `id`, `pro_id` references pros, `name`, `email`, `phone`, `message`, `status`, `created_at`
- `memberships` (tier selections by pros for billing)
  - `id`, `pro_id`, `email`, `tier`, `status` ('pending', 'active'), `created_at`
2. Security
- RLS enabled on all tables.
- `pros` and reading approved listings are publicly readable by anyone (anon + authenticated).
- `inquiries` and `memberships` accept public inserts, no public read.
- Admin access is password-gated at the application level and uses the service role key.
*/

CREATE TABLE IF NOT EXISTS pros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  trade_slug text NOT NULL,
  trade_name text NOT NULL,
  phone text NOT NULL,
  website text,
  address text,
  city text DEFAULT 'Atlanta',
  state text DEFAULT 'GA',
  zip text,
  neighborhoods text[] DEFAULT '{}',
  services text[] DEFAULT '{}',
  hours text DEFAULT 'Mon-Fri 8am-6pm',
  rating numeric(2,1),
  review_count int DEFAULT 0,
  review_url text,
  tier text DEFAULT 'free' CHECK (tier IN ('free', 'featured', 'premium')),
  approved boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_id uuid NOT NULL REFERENCES pros(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_id uuid NOT NULL REFERENCES pros(id) ON DELETE CASCADE,
  email text NOT NULL,
  tier text NOT NULL CHECK (tier IN ('featured', 'premium')),
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pros ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- Public can read only approved pros
DROP POLICY IF EXISTS "public_read_approved_pros" ON pros;
CREATE POLICY "public_read_approved_pros" ON pros FOR SELECT
  TO anon, authenticated USING (approved = true);

-- Inquiries: anyone can submit, no public read
DROP POLICY IF EXISTS "public_insert_inquiries" ON inquiries;
CREATE POLICY "public_insert_inquiries" ON inquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Memberships: anyone can create, no public read
DROP POLICY IF EXISTS "public_insert_memberships" ON memberships;
CREATE POLICY "public_insert_memberships" ON memberships FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_pros_trade ON pros(trade_slug);
CREATE INDEX IF NOT EXISTS idx_pros_tier ON pros(tier);
CREATE INDEX IF NOT EXISTS idx_pros_approved ON pros(approved);
CREATE INDEX IF NOT EXISTS idx_inquiries_pro ON inquiries(pro_id);
CREATE INDEX IF NOT EXISTS idx_memberships_pro ON memberships(pro_id);
