import Link from 'next/link';
import { Check, ArrowRight, MapPin } from 'lucide-react';
import { trades } from '@/lib/trades';
import { neighborhoods } from '@/lib/neighborhoods';
import { getApprovedPros, Pro } from '@/lib/supabase';
import { ProCard } from '@/components/pro-card';
import { TradeIcon } from '@/components/trade-icon';

export const metadata = {
  title: 'The Atlanta List: Atlanta home pros you don\'t have to second-guess',
  description:
    'A curated directory of top-rated Atlanta plumbers, electricians, HVAC techs, roofers, and house cleaners. Real businesses, verified ratings, and rankings nobody can buy.',
};

export const revalidate = 60;

const howItWorks = [
  { title: 'Browse by trade or neighborhood', body: 'Pick a category or see who serves your Atlanta neighborhood.' },
  { title: 'Shortlist pros', body: 'Compare ratings and review counts side by side.' },
  { title: 'Contact directly', body: 'Request a quote from the pro. No middleman, no call center.' },
  { title: 'Hire with confidence', body: 'Every pro is rated by real Atlanta homeowners, not by who paid the most.' },
];

const heroImage =
  'https://images.pexels.com/photos/2815169/pexels-photo-2815169.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

export default async function HomePage() {
  const perTrade = await Promise.all(
    trades.map(async (t) => {
      const list = await getApprovedPros({ trade: t.slug });
      // Highest rated pro per trade, so the ordering matches what we promise homeowners.
      return [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0];
    })
  );
  const featured = perTrade.filter(Boolean) as Pro[];

  return (
    <>
      {/* Cinematic full-bleed hero */}
      <section className="relative flex min-h-[88vh] flex-col justify-end overflow-hidden">
        <img
          src={heroImage}
          alt="Atlanta skyline at golden hour"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-primary/60 to-primary/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />

        <div className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-32 sm:px-6 sm:pb-24">
          <p className="inline-block rounded-full border border-cream/40 bg-black/25 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cream backdrop-blur-sm">
            The Atlanta List
          </p>
          <h1 className="mt-6 max-w-3xl font-serif text-5xl font-bold leading-[1.02] tracking-tight text-cream drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] sm:text-7xl">
            Atlanta home pros you don&apos;t have to second-guess.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]">
            A curated directory of top-rated plumbers, electricians, HVAC techs, roofers,
            and house cleaners. Real businesses, verified ratings, and rankings nobody can buy.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/quiz"
              className="rounded-lg bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Find your pro
            </Link>
            <Link
              href="/trades"
              className="rounded-lg border border-cream/50 bg-black/30 px-7 py-3.5 text-sm font-semibold text-cream backdrop-blur-sm transition hover:bg-black/45"
            >
              Browse trades
            </Link>
          </div>
        </div>
      </section>

      {/* Why pros switch strip */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Check className="h-4 w-4" />
              </span>
              <div>
                <p className="font-medium">No pay-to-play ranking</p>
                <p className="text-sm text-muted-foreground">Pros can&apos;t buy their way to the top.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Check className="h-4 w-4" />
              </span>
              <div>
                <p className="font-medium">Flat membership rent</p>
                <p className="text-sm text-muted-foreground">Price known up front, no surprises.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Check className="h-4 w-4" />
              </span>
              <div>
                <p className="font-medium">Curated Atlanta list</p>
                <p className="text-sm text-muted-foreground">Real businesses, five trades, verified ratings.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Trade grid */}
        <section className="py-14">
          <h2 className="font-serif text-3xl font-semibold">Browse by trade</h2>
          <p className="mt-2 text-muted-foreground">Five trades Atlanta homeowners ask for most.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {trades.map((t) => (
              <Link
                key={t.slug}
                href={`/${t.slug}`}
                className="group rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <TradeIcon trade={t.slug} />
                <h3 className="mt-4 font-serif text-lg font-semibold group-hover:text-accent">
                  {t.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{t.intro}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured pros */}
        {featured.length > 0 && (
          <section className="py-14">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-serif text-3xl font-semibold">Featured pros</h2>
                <p className="mt-2 text-muted-foreground">
                  Ranked by rating, not by who paid the most.
                </p>
              </div>
              <Link href="/for-pros" className="flex items-center gap-1 text-sm font-semibold text-accent hover:opacity-80">
                Become featured <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <ProCard key={p.id} pro={p} compact />
              ))}
            </div>
          </section>
        )}

        {/* Neighborhood browse */}
        <section className="py-14">
          <h2 className="font-serif text-3xl font-semibold">Browse by neighborhood</h2>
          <p className="mt-2 text-muted-foreground">Pros organized by where they actually serve.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {neighborhoods.map((n) => (
              <Link
                key={n.slug}
                href={`/areas/${n.slug}`}
                className="group rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Neighborhood</span>
                </div>
                <h3 className="mt-3 font-serif text-xl font-semibold group-hover:text-accent">
                  {n.name}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground">{n.intro}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="rounded-2xl border border-border bg-card py-14">
          <div className="px-5 sm:px-8">
            <h2 className="font-serif text-3xl font-semibold">How The Atlanta List works</h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {howItWorks.map((s, i) => (
                <div key={i}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                    {i + 1}
                  </span>
                  <h3 className="mt-3 font-serif text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pro CTA */}
        <section className="py-14">
          <div className="rounded-2xl bg-primary p-8 sm:p-12">
            <div className="grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-center">
              <div>
                <h2 className="font-serif text-3xl font-semibold text-primary-foreground">
                  Are you a home service pro in Atlanta?
                </h2>
                <p className="mt-3 max-w-xl text-primary-foreground/80">
                  Get found by Atlanta homeowners searching for your trade. Claim your listing
                  and join a curated directory built on ratings, not lead fees.
                </p>
              </div>
              <div className="md:text-right">
                <Link
                  href="/for-pros"
                  className="inline-block rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90"
                >
                  Claim a listing
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
