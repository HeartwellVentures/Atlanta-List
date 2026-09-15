'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Check, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    notes: ['Basic listing', 'Standard ranking', 'Unlimited inquiries'],
    highlight: false,
  },
  {
    name: 'Featured',
    price: '$79 / month',
    notes: ['Featured badge', 'Higher ranking across the directory', 'Priority neighborhood placement'],
    highlight: true,
  },
  {
    name: 'Premium',
    price: '$599 / year',
    notes: ['Premium badge', 'Homepage placement', 'Top ranking plus partner outreach'],
    highlight: true,
  },
];

const comparison = [
  { label: 'Angi / Thumbtack', ours: false, notes: ['Charges per lead', 'Costs rise with competition', 'You rent visibility forever'] },
  { label: 'The Atlanta List', ours: true, notes: ['Flat monthly rent', 'Price is known up front', 'Direct homeowner contact'] },
];

export default function ForProsPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searchDone, setSearchDone] = useState(false);

  async function claimSearch() {
    const { data } = await supabase
      .from('pros')
      .select('id, slug, name, trade_name, tier')
      .ilike('name', `%${query}%`)
      .eq('approved', true)
      .limit(5);
    setResults(data ?? []);
    setSearchDone(true);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-4xl font-bold">For Atlanta home pros, a flat-rent directory</h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">
        Angi and Thumbtack sell you visibility one lead at a time, and they charge every lead.
        The Atlanta List charges flat membership. Keep more of what you earn.
      </p>

      <section className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="font-serif text-2xl font-semibold">Why their fees hurt</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {comparison.map((c, i) => (
            <div key={i} className={`rounded-xl p-5 ${c.ours ? 'bg-secondary' : 'border border-border'}`}>
              <p className="font-semibold">{c.label}</p>
              <ul className="mt-3 space-y-2 text-sm">
                {c.notes.map((n) => (
                  <li key={n} className="flex gap-2">
                    <span className={`mt-0.5 h-4 w-4 rounded-full ${c.ours ? 'bg-primary text-primary-foreground' : 'bg-muted'}`} />
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="tiers" className="mt-12">
        <h2 className="font-serif text-2xl font-semibold">Membership tiers</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {tiers.map((t, i) => (
            <div
              key={t.name}
              className={`flex flex-col rounded-xl border p-6 ${t.highlight ? 'bg-card shadow-md' : 'border-border bg-card'}`}
            >
              <p className="font-medium">{t.name}</p>
              <p className="mt-2 font-serif text-3xl font-bold">{t.price}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm">
                {t.notes.map((n) => (
                  <li key={n} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-accent" />
                    {n}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => document.getElementById('claim')?.scrollIntoView({ behavior: 'smooth' })}
                className="mt-5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
              >
                Claim this tier
              </button>
            </div>
          ))}
        </div>
      </section>

      <section id="claim" className="mt-12 rounded-2xl bg-secondary p-6 sm:p-8">
        <h2 className="font-serif text-2xl font-semibold">Claim your listing</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Search your business on The Atlanta List. Claim a Free, Featured, or Premium membership.
        </p>
        <div className="mt-4 flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Business name"
            className="flex-1"
          />
          <Button onClick={claimSearch} className="bg-accent text-accent-foreground hover:opacity-90">
            Search
          </Button>
        </div>
        {searchDone && (
          <div className="mt-4 rounded-lg bg-card p-4">
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No listing found for "{query}". You can still be featured with a new listing.
              </p>
            ) : (
              <div className="grid gap-3">
                {results.map((r) => (
                  <Link
                    key={r.id}
                    href={`/pro/${r.slug}#claim`}
                    className="flex items-center justify-between rounded border border-border p-3 hover:bg-secondary"
                  >
                    <div>
                      <p className="font-semibold">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.trade_name}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                      Choose tier <ArrowRight className="h-4 w-4" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
