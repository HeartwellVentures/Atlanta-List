import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Star, MapPin, Phone, Clock, Globe } from 'lucide-react';
import { getProBySlug, getApprovedPros, Pro } from '@/lib/supabase';
import { tradeImage } from '@/lib/trades';
import { DATA_VERIFIED_LABEL } from '@/lib/site';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Schema } from '@/components/schema';
import { TradeIcon } from '@/components/trade-icon';
import QuoteForm from '@/components/quote-form';
import ClaimForm from '@/components/claim-form';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { safeExternalUrl } from '@/lib/utils';

export const revalidate = 60;

/** Answer-first summary: a quotable identity line for search snippets, AI
 *  answers, and the visible page lede. Built only from verified fields. */
function proSummary(pro: Pro): string {
  const trade =
    pro.trade_name === 'HVAC tech' ? 'HVAC tech' : pro.trade_name.toLowerCase();
  const article = /^[aeiou]/i.test(pro.trade_name) ? 'an' : 'a';
  const area =
    pro.neighborhoods && pro.neighborhoods.length > 0 && pro.neighborhoods.length <= 3
      ? pro.neighborhoods.join(', ')
      : 'the Atlanta area';
  const proof =
    pro.rating && pro.review_count
      ? `rated ${pro.rating.toFixed(1)} across ${pro.review_count.toLocaleString()} homeowner reviews`
      : 'rated by Atlanta homeowners';
  const specialties =
    pro.services && pro.services.length
      ? `, known for ${pro.services
          .slice(0, 2)
          .map((s) => s.toLowerCase())
          .join(' and ')}`
      : '';
  return `${pro.name} is ${article} ${trade} serving ${area}, ${proof}${specialties}.`;
}

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pro = await getProBySlug(params.slug);
  if (!pro) return {};
  const description = proSummary(pro);
  return {
    title: `${pro.name}, ${pro.trade_name} in Atlanta`,
    description,
    alternates: { canonical: `/pro/${pro.slug}` },
    openGraph: {
      title: `${pro.name}, ${pro.trade_name} in Atlanta`,
      description,
      type: 'profile',
      images: [pro.photo_url ?? tradeImage(pro.trade_slug, pro.slug)],
    },
  };
}

export default async function ProPage({ params }: Props) {
  const pro = await getProBySlug(params.slug);
  if (!pro || !pro.approved) notFound();

  const websiteUrl = safeExternalUrl(pro.website);
  const reviewUrl = safeExternalUrl(pro.review_url);
  const reviewCount = pro.review_count ?? 0;
  const highlyReviewed = reviewCount >= 500;

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: pro.name,
    telephone: pro.phone,
    // Admin-written description when present; otherwise the generated
    // answer-first summary (built only from verified fields).
    description: pro.description ?? proSummary(pro),
    ...(pro.photo_url ? { image: pro.photo_url } : {}),
    // Hours are free text in the data model; emitted as text until structured hours exist.
    ...(pro.hours ? { openingHours: pro.hours } : {}),
    address: pro.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: pro.address,
          addressLocality: pro.city ?? 'Atlanta',
          addressRegion: pro.state ?? 'GA',
          ...(pro.zip ? { postalCode: pro.zip } : {}),
        }
      : undefined,
    aggregateRating:
      pro.rating && pro.review_count
        ? {
            '@type': 'AggregateRating',
            ratingValue: pro.rating,
            reviewCount: pro.review_count,
          }
        : undefined,
    url: websiteUrl ?? undefined,
    areaServed: pro.neighborhoods?.length
      ? pro.neighborhoods.map((n) => ({ '@type': 'City', name: n }))
      : undefined,
  };

  // Per-listing FAQs, generated only from verified fields (no invented facts).
  const faqs = [
    {
      q: `How do I contact ${pro.name}?`,
      a: `Call ${pro.name} at ${pro.phone}${pro.hours ? ` (${pro.hours})` : ''}, or send a quote request through the form on this page. Your request goes straight to the pro; The Atlanta List never sells or shares inquiry leads.`,
    },
    {
      q: `What areas does ${pro.name} serve?`,
      a:
        pro.neighborhoods && pro.neighborhoods.length
          ? `${pro.name} serves ${pro.neighborhoods.join(', ')}.`
          : `${pro.name} serves the Atlanta area.`,
    },
    ...(pro.services && pro.services.length
      ? [
          {
            q: `What services does ${pro.name} offer?`,
            a: `${pro.name} offers ${pro.services.join(', ').toLowerCase()}.`,
          },
        ]
      : []),
    ...(pro.rating
      ? [
          {
            q: `Is ${pro.name} well reviewed?`,
            a: `Yes. ${pro.name} is rated ${pro.rating.toFixed(1)} out of 5 across ${(pro.review_count ?? 0).toLocaleString()} homeowner reviews.`,
          },
        ]
      : []),
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[{ label: pro.trade_name, href: `/${pro.trade_slug}` }, { label: pro.name }]}
      />

      <Schema data={localBusinessSchema} />
      <Schema data={faqSchema} />

      <div className="mt-6 rounded-2xl border border-border bg-card p-7 sm:p-9">
        <img
          src={pro.photo_url ?? tradeImage(pro.trade_slug, pro.slug)}
          alt={pro.photo_url ? pro.name : `${pro.trade_name} at work in Atlanta`}
          className="mb-6 aspect-[16/9] w-full rounded-xl object-cover"
        />
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <TradeIcon trade={pro.trade_slug} />
            <div>
              <h1 className="font-serif text-3xl font-bold">{pro.name}</h1>
              <p className="text-sm text-muted-foreground">{pro.trade_name}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {pro.tier !== 'free' && (
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                {pro.tier === 'featured' ? 'Featured member' : 'Premium member'}
              </span>
            )}
            {highlyReviewed && (
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                Highly reviewed
              </span>
            )}
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {pro.description ?? proSummary(pro)}
        </p>

        {pro.rating && (
          <div className="mt-6 flex items-baseline gap-3">
            <span className="flex items-center gap-1.5 font-serif text-3xl font-bold leading-none text-foreground">
              <Star className="h-6 w-6 fill-current text-accent" />
              {pro.rating.toFixed(1)}
            </span>
            <span className="text-base font-semibold text-muted-foreground">
              {reviewCount.toLocaleString()} reviews
            </span>
            {reviewUrl && (
              <a
                href={reviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-sm font-semibold text-accent hover:opacity-80"
              >
                View reviews
              </a>
            )}
          </div>
        )}

        <div className="mt-7 grid gap-6 sm:grid-cols-2">
          {pro.address && (
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold">
                <MapPin className="h-4 w-4 text-muted-foreground" /> Address
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {pro.address}{pro.city ? `, ${pro.city}` : ''}{pro.zip ? ` ${pro.zip}` : ''}
              </p>
            </div>
          )}
          {pro.hours && (
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Clock className="h-4 w-4 text-muted-foreground" /> Hours
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{pro.hours}</p>
            </div>
          )}
          {websiteUrl && (
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Globe className="h-4 w-4 text-muted-foreground" /> Website
              </p>
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 text-sm text-accent hover:opacity-80"
              >
                {websiteUrl.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
          {pro.phone && (
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Phone className="h-4 w-4 text-muted-foreground" /> Phone
              </p>
              <a href={`tel:${pro.phone}`} className="mt-1 text-sm text-accent hover:opacity-80">
                {pro.phone}
              </a>
            </div>
          )}
        </div>

        {pro.neighborhoods && pro.neighborhoods.length > 0 && (
          <div className="mt-7">
            <p className="text-sm font-semibold">Service areas</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {pro.neighborhoods.map((n) => (
                <span key={n} className="rounded-full border border-border px-3 py-1 text-xs">
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}

        {pro.services && pro.services.length > 0 && (
          <div className="mt-7">
            <p className="text-sm font-semibold">Specialties</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {pro.services.map((s) => (
                <li key={s} className="rounded bg-muted px-3 py-1 text-xs text-muted-foreground">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-7 text-xs text-muted-foreground">
          Listing details verified {DATA_VERIFIED_LABEL} against public sources. Ratings are snapshots; see the live review page for the current number.
        </p>
      </div>

      <section className="mt-10 rounded-2xl border border-border bg-card p-7 sm:p-9">
        <h2 className="font-serif text-2xl font-semibold">Request a quote</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your request goes straight to the pro. No middleman, no call center.
        </p>
        <div className="mt-5">
          <QuoteForm proId={pro.id} proName={pro.name} />
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-border bg-card p-7 sm:p-9">
        <h2 className="font-serif text-2xl font-semibold">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="mt-4">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`q-${i}`}>
              <AccordionTrigger className="text-left font-medium">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section id="claim" className="mt-10 scroll-mt-24 rounded-2xl border border-border bg-card p-7 sm:p-9">
        <h2 className="font-serif text-2xl font-semibold">Claim this listing</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Own this business? Claim the listing to manage it and choose a membership tier.
        </p>
        <div className="mt-5">
          <ClaimForm proSlug={pro.slug} proName={pro.name} />
        </div>
      </section>
    </div>
  );
}
