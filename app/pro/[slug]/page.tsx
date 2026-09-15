import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Star, MapPin, Phone, Clock, Globe } from 'lucide-react';
import { getProBySlug, getApprovedPros } from '@/lib/supabase';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Schema } from '@/components/schema';
import { TradeIcon } from '@/components/trade-icon';
import QuoteForm from '@/components/quote-form';

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pro = await getProBySlug(params.slug);
  if (!pro) return {};
  return {
    title: `${pro.name} | ${pro.trade_name} in Atlanta`,
    description: `${pro.trade_name} serving Atlanta. Rating ${pro.rating?.toFixed(1) ?? 'N/A'}, ${pro.review_count?.toLocaleString() ?? 'many'} reviews.`,
  };
}

export default async function ProPage({ params }: Props) {
  const pro = await getProBySlug(params.slug);
  if (!pro || !pro.approved) notFound();

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: pro.name,
    telephone: pro.phone,
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
    url: pro.website,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[{ label: pro.trade_name, href: `/${pro.trade_slug}` }, { label: pro.name }]}
      />

      <Schema data={localBusinessSchema} />

      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <TradeIcon trade={pro.trade_slug} />
            <div>
              <h1 className="font-serif text-3xl font-bold">{pro.name}</h1>
              <p className="text-sm text-muted-foreground">{pro.trade_name}</p>
              {pro.tier !== 'free' && (
                <span className="mt-2 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                  {pro.tier === 'featured' ? 'Featured member' : 'Premium member'}
                </span>
              )}
            </div>
          </div>
        </div>

        {pro.rating && (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 rounded bg-secondary px-2 py-1 text-sm font-semibold text-secondary-foreground">
              <Star className="h-4 w-4 fill-current text-accent" />
              {pro.rating.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              {(pro.review_count ?? 0).toLocaleString()} aggregated reviews
            </span>
            {pro.review_url && (
              <a
                href={pro.review_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-accent hover:opacity-80"
              >
                View reviews
              </a>
            )}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
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
          {pro.website && (
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Globe className="h-4 w-4 text-muted-foreground" /> Website
              </p>
              <a
                href={pro.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 text-sm text-accent hover:opacity-80"
              >
                {pro.website.replace(/^https?:\/\//, '')}
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
          <div>
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
          <div>
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
      </div>

      <section className="mt-10 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="font-serif text-2xl font-semibold">Request a quote</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your request goes straight to the pro. The Atlanta List never charges per lead.
        </p>
        <div className="mt-5">
          <QuoteForm proId={pro.id} proName={pro.name} />
        </div>
      </section>
    </div>
  );
}
