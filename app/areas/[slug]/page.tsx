import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { neighborhoods } from '@/lib/neighborhoods';
import { tradeImage } from '@/lib/trades';
import { getApprovedPros } from '@/lib/supabase';
import { ProCard } from '@/components/pro-card';
import { FeaturedSpotlight, getSpotlightPros } from '@/components/featured-spotlight';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Schema } from '@/components/schema';
import { SITE_URL } from '@/lib/site';

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = neighborhoods.find((n) => n.slug === params.slug)?.name;
  if (!name) return {};
  const description = `Curated plumbers, electricians, HVAC techs, roofers, and cleaners serving ${name}.`;
  return {
    title: `${name} home services`,
    description,
    alternates: { canonical: `/areas/${params.slug}` },
    openGraph: {
      title: `${name} home services`,
      description,
      type: 'website',
      images: [tradeImage('plumbers', params.slug)],
    },
  };
}

export default async function NeighborhoodPage({ params }: Props) {
  const neighborhood = neighborhoods.find((n) => n.slug === params.slug);
  if (!neighborhood) notFound();

  const pros = await getApprovedPros({ neighborhood: neighborhood.name });
  const spotlight = getSpotlightPros(pros);
  const spotlightIds = new Set(spotlight.map((p) => p.id));
  const ranked = pros.filter((p) => !spotlightIds.has(p.id));

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${neighborhood.name} home service pros`,
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
      <Breadcrumbs
        items={[
          { label: 'Neighborhoods', href: '/areas' },
          { label: neighborhood.name },
        ]}
      />
      <Schema data={itemListSchema} />
      <h1 className="mt-6 font-serif text-4xl font-bold">{neighborhood.name} pros</h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">{neighborhood.intro}</p>
      {spotlight.length > 0 && (
        <div className="mt-10">
          <FeaturedSpotlight pros={spotlight} />
        </div>
      )}
      <div className="mt-10 grid gap-4">
        {ranked.length === 0 ? (
          <p className="text-muted-foreground">No approved pros serving {neighborhood.name} yet.</p>
        ) : (
          ranked.map((p) => <ProCard key={p.id} pro={p} />)
        )}
      </div>
    </div>
  );
}
