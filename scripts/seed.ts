#!/usr/bin/env node
/* Seeds the pros table from lib/seed.ts. Run with: node -r ts-node/register scripts/seed.ts */
import { createClient } from '@supabase/supabase-js';
import { seedPros } from '../lib/seed';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
if (!url || !key) {
  console.error('Missing Supabase credentials in environment.');
  process.exit(1);
}
const supabase = createClient(url, key);

async function run() {
  const rows = seedPros.map((p) => ({ ...p }));
  // upsert by slug to be idempotent
  const { error } = await supabase.from('pros').upsert(rows, { onConflict: 'slug' });
  if (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
  console.log(`Seeded ${rows.length} pros.`);
}

run();
