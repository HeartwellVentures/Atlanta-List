import { createClient } from '@supabase/supabase-js';
import type { SeedPro } from './seed';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Pro {
  id: string;
  slug: string;
  name: string;
  trade_slug: string;
  trade_name: string;
  phone: string;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  neighborhoods?: string[] | null;
  services?: string[] | null;
  hours?: string | null;
  rating?: number | null;
  review_count?: number | null;
  review_url?: string | null;
  tier: 'free' | 'featured' | 'premium';
  approved: boolean;
  photo_url?: string | null;
  description?: string | null;
  license_number?: string | null;
}

export async function getApprovedPros(filters?: {
  trade?: string;
  neighborhood?: string;
  featuredFirst?: boolean;
  limit?: number;
}) {
  let query = supabase
    .from('pros')
    .select('*')
    .eq('approved', true);
  if (filters?.trade) query = query.eq('trade_slug', filters.trade);

  const { data, error } = await query;
  if (error) return [] as Pro[];
  let pros = (data ?? []) as Pro[];
  if (filters?.neighborhood) {
    pros = pros.filter((p) =>
      (p.neighborhoods ?? []).includes(filters.neighborhood!)
    );
  }
  // Rankings are strictly by rating, then review count, then name.
  // Paid tiers buy labeled visibility, never rank.
  pros.sort(
    (a, b) =>
      (b.rating ?? 0) - (a.rating ?? 0) ||
      (b.review_count ?? 0) - (a.review_count ?? 0) ||
      a.name.localeCompare(b.name)
  );
  if (filters?.limit) pros = pros.slice(0, filters.limit);
  return pros;
}

export async function getProBySlug(slug: string) {
  const { data, error } = await supabase
    .from('pros')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error || !data) return null;
  return data as Pro;
}
