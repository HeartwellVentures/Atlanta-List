import { Pro } from '@/lib/supabase';
import { ProCard } from '@/components/pro-card';

/** Pros paying for visibility (featured/premium tiers), capped at 3. */
export function getSpotlightPros(pros: Pro[]): Pro[] {
  return pros
    .filter((p) => p.tier === 'featured' || p.tier === 'premium')
    .slice(0, 3);
}

/**
 * A clearly labeled paid-placement strip. Rankings are never sold;
 * this strip is the only place paid tiers buy visibility.
 */
export function FeaturedSpotlight({ pros }: { pros: Pro[] }) {
  if (pros.length === 0) return null;
  return (
    <section
      aria-label="Featured placement"
      className="rounded-2xl border border-border bg-card p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-xl font-semibold">Featured placement</h2>
        <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
          Paid placement
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        These pros paid for this spot. It is not a ranking. The list below is
        ordered by rating and review count only.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pros.map((p) => (
          <ProCard key={p.id} pro={p} compact />
        ))}
      </div>
    </section>
  );
}
