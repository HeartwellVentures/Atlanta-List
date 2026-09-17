import Link from 'next/link';
import { Star, MapPin, BadgeCheck } from 'lucide-react';
import { TradeIcon } from '@/components/trade-icon';
import { tradeImage } from '@/lib/trades';
import type { Pro } from '@/lib/supabase';

export function ProCard({ pro, compact = false }: { pro: Pro; compact?: boolean }) {
  const neighborhoods = pro.neighborhoods?.slice(0, compact ? 2 : 4) ?? [];
  const reviewCount = pro.review_count ?? 0;
  const highlyReviewed = reviewCount >= 500;

  return (
    <Link
      href={`/pro/${pro.slug}`}
      className="group block rounded-xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <img
        src={pro.photo_url ?? tradeImage(pro.trade_slug, pro.slug)}
        alt={pro.photo_url ? pro.name : `${pro.trade_name} at work`}
        loading="lazy"
        className="mb-5 aspect-[16/9] w-full rounded-lg object-cover"
      />
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
        <div className="flex flex-col items-end gap-1.5">
          <span
            className="flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent"
            title="Listing details verified against public sources"
          >
            <BadgeCheck className="h-3.5 w-3.5" />
            Verified
          </span>
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
          {highlyReviewed && (
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              Highly reviewed
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-baseline gap-2.5">
        <span className="flex items-center gap-1 font-serif text-2xl font-bold leading-none text-foreground">
          <Star className="h-5 w-5 fill-current text-accent" />
          {pro.rating?.toFixed(1) ?? 'N/A'}
        </span>
        <span className="text-sm font-semibold text-muted-foreground">
          {reviewCount > 0 ? `${reviewCount.toLocaleString()} reviews` : 'See reviews'}
        </span>
      </div>

      {neighborhoods.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          {neighborhoods.map((n) => (
            <span key={n} className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
              {n}
            </span>
          ))}
        </div>
      )}

      {!compact && pro.services && pro.services.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
          {pro.services.slice(0, 4).map((s) => (
            <li key={s} className="rounded bg-muted px-2.5 py-1">{s}</li>
          ))}
        </ul>
      )}
    </Link>
  );
}
