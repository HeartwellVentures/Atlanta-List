/*
  # Listing claims

  1. Changes
  - Creates `claims` for pro claim requests (existing listings and new-listing
    requests). `pro_id` is null for new-listing requests.
  - `status` tracks the admin review lifecycle: pending, approved, rejected.

  2. Security
  - RLS is enabled and NO policies are granted to anon/authenticated, so all
    direct public access is denied. Claims are written and read only through
    edge functions using the service role key (checkout, admin-pros).
*/

create table claims (
  id uuid primary key default gen_random_uuid(),
  pro_id uuid references pros(id) on delete set null,
  business_name text not null,
  tier text not null check (tier in ('free','featured','premium')),
  contact_name text not null,
  email text not null,
  phone text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

alter table claims enable row level security;

-- No public policies: anon/authenticated get no select/insert/update/delete.
-- All access goes through edge functions with the service role key.

create index if not exists idx_claims_pro on claims(pro_id);
create index if not exists idx_claims_status on claims(status);
create index if not exists idx_claims_created on claims(created_at desc);
