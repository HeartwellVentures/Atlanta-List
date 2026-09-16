import { MetadataRoute } from 'next';
import { trades } from '../lib/trades';
import { neighborhoods } from '../lib/neighborhoods';
import { supabase } from '../lib/supabase';
import { SITE_URL } from '../lib/site';

function siteUrl(): string {
  return SITE_URL;
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
