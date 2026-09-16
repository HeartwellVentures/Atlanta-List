import { MetadataRoute } from 'next';
import { trades } from '../lib/trades';
import { neighborhoods } from '../lib/neighborhoods';
import { supabase } from '../lib/supabase';

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://theatlantalist.com';
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const routes = [
    '',
    '/trades',
    '/areas',
    '/quiz',
    '/for-pros',
    ...trades.map((t) => `/${t.slug}`),
    ...neighborhoods.map((n) => `/areas/${n.slug}`),
  ];

  const { data } = await supabase
    .from('pros')
    .select('slug')
    .eq('approved', true);
  const proRoutes = (data ?? []).map((p) => `/pro/${p.slug}`);

  return [...routes, ...proRoutes].map((r) => ({
    url: `${base}${r}`,
    lastModified: new Date(),
  }));
}
