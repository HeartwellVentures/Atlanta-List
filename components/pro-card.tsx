import Link from 'next/link';
import { Star, MapPin, Phone } from 'lucide-react';
import { TradeIcon } from '@/components/trade-icon';
import type { Pro } from '@/lib/supabase';

export function ProCard({ pro, compact = false }: { pro: Pro; compact?: boolean }) {
  const neighborhoods = pro.neighborhoods?.slice(0, compact ? 2 : 4) ?? [];
  return (
    <Link
      href={`/pro/${pro.slug}`}
      className="group block rounded-xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <TradeIcon trade={pro.trade_slug} />
          <div>
            <h3 className="font-serif text-lg font-semibold leading-snug text-foreground group-hover:text-accent">
              {pro.name}
            </h3>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {pro.trade_name}
            </p>
          </div>
        </div>
        {pro.tier === 'featured' && (
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            Featured
          </span>
        )}
        {pro.tier === 'premium' && (
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            Premium
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs font-semibold text-secondary-foreground">
          <Star className="h-3.5 w-3.5 fill-current text-accent" />
          {pro.rating?.toFixed(1) ?? 'N/A'}
        </span>
        <span className="text-xs text-muted-foreground">
          {pro.review_count != null ? `${pro.review_count.toLocaleString()} reviews` : 'See reviews'}
        </span>
      </div>

      {neighborhoods.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          {neighborhoods.map((n) => (
            <span key={n} className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
              {n}
            </span>
          ))}
        </div>
      )}

      {!compact && pro.services && pro.services.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
          {pro.services.slice(0, 4).map((s) => (
            <li key={s} className="rounded bg-muted px-2 py-0.5">{s}</li>
          ))}
        </ul>
      )}
    </Link>
  );
}
