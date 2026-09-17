import Link from 'next/link';
import { Wrench } from 'lucide-react';
import { trades } from '@/lib/trades';
import { neighborhoods } from '@/lib/neighborhoods';

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Wrench className="h-5 w-5" />
            </span>
            <span className="font-serif text-lg font-semibold">The Atlanta List</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Curated Atlanta pros, ranked by rating. Paid featured spots are always labeled.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Trades
          </h4>
          <ul className="mt-3 space-y-2 text-sm">
            {trades.map((t) => (
              <li key={t.slug}>
                <Link href={`/${t.slug}`} className="hover:text-accent">
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Neighborhoods
          </h4>
          <ul className="mt-3 space-y-2 text-sm">
            {neighborhoods.map((n) => (
              <li key={n.slug}>
                <Link href={`/areas/${n.slug}`} className="hover:text-accent">
                  {n.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Explore
          </h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/quiz" className="hover:text-accent">Find Your Pro</Link>
            </li>
            <li>
              <Link href="/for-pros" className="hover:text-accent">For Pros</Link>
            </li>
            <li>
              <Link href="/sitemap.xml" className="hover:text-accent">Sitemap</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
          The Atlanta List is an independent directory. Rankings are based on ratings and review counts. Paid featured spots are always labeled. Directory data compiled September 2026 from public business sources; ratings link to live review pages.
        </p>
      </div>
    </footer>
  );
}
