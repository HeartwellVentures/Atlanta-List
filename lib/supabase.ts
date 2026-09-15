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
  const rank: Record<string, number> = { premium: 0, featured: 1, free: 2 };
  pros.sort((a, b) => rank[a.tier] - rank[b.tier]);
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
