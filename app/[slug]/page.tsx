import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTrade, trades } from '@/lib/trades';
import { getApprovedPros } from '@/lib/supabase';
import { ProCard } from '@/components/pro-card';
import { FeaturedSpotlight, getSpotlightPros } from '@/components/featured-spotlight';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Schema } from '@/components/schema';
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
  };
}

export default async function TradePage({ params }: Props) {
  const trade = getTrade(params.slug);
  if (!trade) notFound();
  const pros = await getApprovedPros({ trade: params.slug });
  const spotlight = getSpotlightPros(pros);
  const spotlightIds = new Set(spotlight.map((p) => p.id));
  const ranked = pros.filter((p) => !spotlightIds.has(p.id));

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: trade.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: 'Trades', href: '/trades' }, { label: trade.name }]} />
      <div className="mt-6">
        <h1 className="font-serif text-4xl font-bold">{trade.name} in Atlanta</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">{trade.intro}</p>
      </div>

      <Schema data={faqSchema} />

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
