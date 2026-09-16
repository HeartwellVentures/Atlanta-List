'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { submitClaim, type ClaimTier } from '@/lib/claims';

const TIERS: { value: ClaimTier; name: string; price: string; blurb: string }[] = [
  {
    value: 'free',
    name: 'Free',
    price: '$0',
    blurb: 'A basic listing. Rankings stay driven by ratings and reviews.',
  },
  {
    value: 'featured',
    name: 'Featured',
    price: '$79 / month',
    blurb: 'A Featured badge and clearly labeled placement. Paid visibility, never paid ranking.',
  },
  {
    value: 'premium',
    name: 'Premium',
    price: '$599 / year',
    blurb: 'Premium badge, homepage placement, and partner outreach. Paid visibility, never paid ranking.',
  },
];

export default function ClaimForm({ proSlug, proName }: { proSlug: string; proName: string }) {
  const [tier, setTier] = useState<ClaimTier>('free');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const contactName = String(form.get('contactName') || '').trim();
    const email = String(form.get('email') || '').trim();
    const phone = String(form.get('phone') || '').trim();
    if (!contactName || !email) {
      setError('Please fill in your name and email.');
      setLoading(false);
      return;
    }
    try {
      await submitClaim({
        proSlug,
        tier,
        contactName,
        email,
        phone: phone || undefined,
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-border bg-secondary p-5 text-sm">
        <p className="font-semibold">Claim received, check your email.</p>
        <p className="mt-1 text-muted-foreground">
          We will email you to complete membership setup for {proName}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="text-sm font-semibold">Choose a membership tier</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {TIERS.map((t) => {
            const selected = tier === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTier(t.value)}
                aria-pressed={selected}
                className={`flex flex-col rounded-xl border p-4 text-left transition ${
                  selected
                    ? 'border-accent ring-2 ring-accent/30 bg-card'
                    : 'border-border bg-card hover:border-accent/50'
                }`}
              >
                <span className="flex items-center justify-between">
                  <span className="font-semibold">{t.name}</span>
                  {selected && <Check className="h-4 w-4 text-accent" />}
                </span>
                <span className="mt-1 font-serif text-xl font-bold">{t.price}</span>
                <span className="mt-2 text-xs text-muted-foreground">{t.blurb}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="contactName" placeholder="Your name" maxLength={120} required />
        <Input name="email" type="email" placeholder="Email" maxLength={200} required />
      </div>
      <Input name="phone" type="tel" placeholder="Phone (optional)" maxLength={40} />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading} className="bg-accent text-accent-foreground hover:opacity-90">
        {loading ? 'Submitting...' : `Claim ${proName}`}
      </Button>
      <p className="text-xs text-muted-foreground">
        No payment is taken now. We review every claim and email you to finish setup.
      </p>
    </form>
  );
}
