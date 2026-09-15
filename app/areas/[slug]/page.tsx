import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { neighborhoods } from '@/lib/neighborhoods';
import { getApprovedPros } from '@/lib/supabase';
import { ProCard } from '@/components/pro-card';
import { Breadcrumbs } from '@/components/breadcrumbs';

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = neighborhoods.find((n) => n.slug === params.slug)?.name;
  if (!name) return {};
  return {
    title: `${name} home services | The Atlanta List`,
    description: `Curated plumbers, electricians, HVAC techs, roofers, and cleaners serving ${name}.`,
  };
}

export default async function NeighborhoodPage({ params }: Props) {
  const neighborhood = neighborhoods.find((n) => n.slug === params.slug);
  if (!neighborhood) notFound();

  const pros = await getApprovedPros({ neighborhood: neighborhood.name });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { label: 'Neighborhoods', href: '/areas' },
          { label: neighborhood.name },
        ]}
      />
      <h1 className="mt-6 font-serif text-4xl font-bold">{neighborhood.name} pros</h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">{neighborhood.intro}</p>
      <div className="mt-10 grid gap-4">
        {pros.length === 0 ? (
          <p className="text-muted-foreground">No approved pros serving {neighborhood.name} yet.</p>
        ) : (
          pros.map((p) => <ProCard key={p.id} pro={p} />)
        )}
      </div>
    </div>
  );
}
