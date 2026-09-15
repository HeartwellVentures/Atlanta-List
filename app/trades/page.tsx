import Link from 'next/link';
import { trades } from '@/lib/trades';
import { TradeIcon } from '@/components/trade-icon';

export const metadata = {
  title: 'Browse trades in Atlanta',
  description: 'Plumbers, electricians, HVAC techs, roofers, and cleaners that serve Atlanta.',
};

export default function TradesIndex() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-4xl font-bold">Browse by trade</h1>
      <p className="mt-3 text-muted-foreground">
        Five trades, one curated list. Each page ranks pros by tier and rating, never by top bid.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {trades.map((t) => (
          <Link
            key={t.slug}
            href={`/${t.slug}`}
            className="group rounded-xl border border-border bg-card p-5 transition hover:shadow-md"
          >
            <TradeIcon trade={t.slug} />
            <h2 className="mt-4 font-serif text-xl font-semibold group-hover:text-accent">
              {t.name}
            </h2>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{t.intro}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
