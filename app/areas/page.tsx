import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { neighborhoods } from '@/lib/neighborhoods';

export const metadata = {
  title: 'Browse by neighborhood in Atlanta',
  description: 'Curated pros across Buckhead, Midtown, Decatur, Virginia-Highland, East Atlanta, Westside, Sandy Springs, and Brookhaven.',
};

export default function AreasIndex() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-4xl font-bold">Browse by neighborhood</h1>
      <p className="mt-3 text-muted-foreground">
        Pros organized by where they actually serve. Your neighborhood page shows the top
        matches across all trades.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {neighborhoods.map((n) => (
          <Link
            key={n.slug}
            href={`/areas/${n.slug}`}
            className="group rounded-xl border border-border bg-card p-5 transition hover:shadow-md"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Neighborhood</span>
            </div>
            <h2 className="mt-3 font-serif text-xl font-semibold group-hover:text-accent">
              {n.name}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{n.intro}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
