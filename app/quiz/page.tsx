'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Clock, ArrowRight, Star } from 'lucide-react';
import { trades } from '@/lib/trades';
import { neighborhoods } from '@/lib/neighborhoods';
import { supabase, Pro } from '@/lib/supabase';
import { TradeIcon } from '@/components/trade-icon';

const whenOptions = ['Today', 'This week', 'Flexible'];

export default function FindYourProPage() {
  const [step, setStep] = useState(1);
  const [trade, setTrade] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [when, setWhen] = useState('');
  const [results, setResults] = useState<Pro[]>([]);
  const [done, setDone] = useState(false);

  async function match() {
    const { data } = await supabase
      .from('pros')
      .select('*')
      .eq('approved', true)
      .eq('trade_slug', trade);

    let matches = (data ?? []) as Pro[];
    let inArea = matches.filter((p) => (p.neighborhoods ?? []).includes(neighborhood));
    let final = inArea.length >= 3 ? inArea : matches;
    final = final
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 3);
    setResults(final);
    setDone(true);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-3xl font-bold">Find your pro</h1>
      <p className="mt-2 text-muted-foreground">
        Answer 3 quick questions, get 3 top-rated pros.
      </p>

      {!done && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <p className="text-sm font-semibold text-muted-foreground">Step {step} of 3</p>

          {step === 1 && (
            <>
              <h2 className="mt-3 font-serif text-2xl font-semibold">What do you need?</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {trades.map((t) => (
                  <button
                    key={t.slug}
                    onClick={() => { setTrade(t.slug); setStep(2); }}
                    className="flex items-center gap-3 rounded-xl border border-border p-4 text-left transition hover:bg-secondary"
                  >
                    <TradeIcon trade={t.slug} />
                    <div>
                      <p className="font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.plural}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="mt-3 font-serif text-2xl font-semibold">Where in Atlanta?</h2>
              <div className="mt-5 grid gap-2">
                {neighborhoods.map((n) => (
                  <button
                    key={n.slug}
                    onClick={() => { setNeighborhood(n.name); setStep(3); }}
                    className="flex items-center gap-2 rounded-lg border border-border p-3 text-left hover:bg-secondary"
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{n.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="mt-3 font-serif text-2xl font-semibold">When do you need it?</h2>
              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                {whenOptions.map((w) => (
                  <button
                    key={w}
                    onClick={() => { setWhen(w); match(); }}
                    className="flex items-center gap-2 rounded-lg border border-border p-4 text-left hover:bg-secondary"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{w}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {done && (
        <div className="mt-8">
          <p className="rounded-lg bg-secondary p-4 text-sm">
            Your match: {trade} · {neighborhood} · {when}
          </p>
          <h2 className="mt-6 font-serif text-2xl font-semibold">Three pros we recommend</h2>
          {results.length === 0 && (
            <p className="mt-4 text-muted-foreground">No matches found. Try a broader neighborhood or trade.</p>
          )}
          <div className="mt-4 grid gap-4">
            {results.map((p, i) => (
              <Link
                href={`/pro/${p.slug}`}
                key={p.id}
                className="group flex items-start justify-between rounded-xl border border-border bg-card p-5 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold group-hover:text-accent">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.trade_name}</p>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className="flex items-center gap-1 text-sm font-bold text-foreground">
                        <Star className="h-4 w-4 fill-current text-accent" />
                        {p.rating?.toFixed(1) ?? 'N/A'}
                      </span>
                      <span className="text-sm font-semibold text-muted-foreground">
                        {p.review_count != null ? `${p.review_count.toLocaleString()} reviews` : 'See reviews'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Serves: {(p.neighborhoods ?? []).slice(0, 3).join(', ')}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent" />
              </Link>
            ))}
          </div>
          <button
            onClick={() => {
              setStep(1); setResults([]); setDone(false); setTrade(''); setNeighborhood(''); setWhen('');
            }}
            className="mt-6 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
          >
            Start over
          </button>
        </div>
      )}
    </div>
  );
}
