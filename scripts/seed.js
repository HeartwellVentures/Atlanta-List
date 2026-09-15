#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const rows = require('./seed-data.js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('Missing Supabase credentials.');
  process.exit(1);
}
const supabase = createClient(url, key);

(async () => {
  const { error } = await supabase.from('pros').upsert(rows, { onConflict: 'slug' });
  if (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
  console.log('Seeded', rows.length, 'pros.');
})();
