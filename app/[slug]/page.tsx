import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BadgeCheck, Wallet, Search, PhoneCall, ThumbsUp } from 'lucide-react';
import { getTrade, trades, tradeImage } from '@/lib/trades';
import { neighborhoods } from '@/lib/neighborhoods';
import { getApprovedPros } from '@/lib/supabase';
import { ProCard } from '@/components/pro-card';
import { FeaturedSpotlight, getSpotlightPros } from '@/components/featured-spotlight';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Schema } from '@/components/schema';
import { SITE_URL } from '@/lib/site';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return trades.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const trade = getTrade(params.slug);
  if (!trade) return {};
  return {
    title: `${trade.name} in Atlanta`,
    description: trade.intro,
    alternates: { canonical: `/${trade.slug}` },
    openGraph: {
      title: `${trade.name} in Atlanta`,
      description: trade.intro,
      type: 'website',
      images: [tradeImage(trade.slug, trade.slug)],
    },
  };
}

export default async function TradePage({ params }: Props) {
  const trade = getTrade(params.slug);
  if (!trade) notFound();
  const pros = await getApprovedPros({ trade: params.slug });
  const spotlight = getSpotlightPros(pros);
  const spotlightIds = new Set(spotlight.map((p) => p.id));
  const ranked = pros.filter((p) => !spotlightIds.has(p.id));

  // Aggregate social proof, computed from real listing data (Angi-style
  // "trusted by" header, but only from numbers we can actually stand behind).
  const rated = pros.filter((p) => p.rating && p.review_count);
  const totalReviews = rated.reduce((s, p) => s + (p.review_count ?? 0), 0);
  const avgRating =
    totalReviews > 0
      ? rated.reduce((s, p) => s + (p.rating ?? 0) * (p.review_count ?? 0), 0) /
        totalReviews
      : 0;
  const hasSocialProof = rated.length > 0 && totalReviews > 0;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: trade.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  // Every ranked pro on the page, so search and AI engines can cite the ranking directly.
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${trade.name} in Atlanta`,
    itemListElement: pros.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'LocalBusiness',
        name: p.name,
        url: `${SITE_URL}/pro/${p.slug}`,
        telephone: p.phone,
        ...(p.rating && p.review_count
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: p.rating,
                reviewCount: p.review_count,
              },
            }
          : {}),
      },
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: 'Trades', href: '/trades' }, { label: trade.name }]} />
      <div className="mt-6">
        <h1 className="font-serif text-4xl font-bold">{trade.name} in Atlanta</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">{trade.intro}</p>
        {hasSocialProof && (
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-border bg-card px-5 py-4">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <BadgeCheck className="h-4 w-4 text-accent" />
              Trusted by Atlanta homeowners
            </span>
            <span className="text-sm text-muted-foreground">
              <strong className="font-serif text-base font-bold text-foreground">
                {avgRating.toFixed(1)}
              </strong>{' '}
              average rating across{' '}
              <strong className="font-semibold text-foreground">
                {totalReviews.toLocaleString()}
              </strong>{' '}
              homeowner reviews of pros on this list
            </span>
          </div>
        )}
      </div>

      <Schema data={faqSchema} />
      <Schema data={itemListSchema} />

      {spotlight.length > 0 && (
        <div className="mt-10">
          <FeaturedSpotlight pros={spotlight} />
        </div>
      )}

      <div className="mt-10 grid gap-4">
        {ranked.length === 0 ? (
          <p className="text-muted-foreground">No approved {trade.plural} yet.</p>
        ) : (
          ranked.map((p) => <ProCard key={p.id} pro={p} />)
        )}
      </div>

      <section className="mt-14 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-semibold">{trade.expertNote.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {trade.expertNote.body}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold">
            <Wallet className="h-5 w-5 text-accent" />
            What it costs in Atlanta
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <strong className="font-semibold text-foreground">{trade.costRange.low}</strong>
            </li>
            <li>
              <strong className="font-semibold text-foreground">{trade.costRange.typical}</strong>
            </li>
            <li>
              <strong className="font-semibold text-foreground">{trade.costRange.high}</strong>
            </li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Typical ranges, not quotes. Always get a written estimate before work begins.
          </p>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="font-serif text-2xl font-semibold">How hiring works</h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-3">
          <li className="flex gap-3">
            <Search className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div>
              <p className="text-sm font-semibold">Browse verified pros</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Every listing is checked against public sources before it appears here.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <PhoneCall className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div>
              <p className="text-sm font-semibold">Contact them directly</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Call or request a quote. Your inquiry goes straight to the pro.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <ThumbsUp className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div>
              <p className="text-sm font-semibold">Hire with confidence</p>
              <p className="mt-1 text-sm text-muted-foreground">
                No middleman, no call center, no sold leads. Just Atlanta pros.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-xl font-semibold">Browse by neighborhood</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {neighborhoods.map((n) => (
            <Link
              key={n.slug}
              href={`/areas/${n.slug}`}
              className="rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground transition hover:border-accent hover:text-accent"
            >
              {n.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="font-serif text-2xl font-semibold">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="mt-4">
          {trade.faq.map((f, i) => (
            <AccordionItem key={i} value={`q-${i}`}>
              <AccordionTrigger className="text-left font-medium">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
