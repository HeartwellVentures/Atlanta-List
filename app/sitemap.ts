import { MetadataRoute } from 'next';
import { trades } from '../lib/trades';
import { neighborhoods } from '../lib/neighborhoods';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://theatlantalist.com';
  const routes = [
    '',
    '/trades',
    '/areas',
    '/quiz',
    '/for-pros',
    '/admin',
    ...trades.map((t) => `/${t.slug}`),
    ...neighborhoods.map((n) => `/areas/${n.slug}`),
  ];
  return routes.map((r) => ({ url: `${base}${r}`, lastModified: new Date() }));
}
