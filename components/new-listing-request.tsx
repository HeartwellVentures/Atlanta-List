'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { submitClaim } from '@/lib/claims';
import { trades } from '@/lib/trades';

/**
 * Compact "request a new listing" form shown when the claim search finds
 * nothing. Submits a claim with proSlug omitted.
 */
export default function NewListingRequest({ initialName }: { initialName: string }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const businessName = String(form.get('businessName') || '').trim();
    const trade = String(form.get('trade') || '').trim();
    const contactName = String(form.get('contactName') || '').trim();
    const email = String(form.get('email') || '').trim();
    if (!businessName || !trade || !contactName || !email) {
      setError('Please fill in every field.');
      setLoading(false);
      return;
    }
    try {
      await submitClaim({ tier: 'free', businessName, trade, contactName, email });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-border bg-secondary p-4 text-sm">
        <p className="font-semibold">Request received, check your email.</p>
        <p className="mt-1 text-muted-foreground">
          We will email you to finish setting up the new listing.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm font-semibold">Do not see your business? Request a new listing.</p>
      <Input
        name="businessName"
        placeholder="Business name"
        defaultValue={initialName}
        maxLength={200}
        required
      />
      <select
        name="trade"
        required
        defaultValue=""
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <option value="" disabled>
          Select your trade
        </option>
        {trades.map((t) => (
          <option key={t.slug} value={t.slug}>
            {t.plural}
          </option>
        ))}
      </select>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="contactName" placeholder="Your name" maxLength={120} required />
        <Input name="email" type="email" placeholder="Email" maxLength={200} required />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading} className="bg-accent text-accent-foreground hover:opacity-90">
        {loading ? 'Submitting...' : 'Request listing'}
      </Button>
    </form>
  );
}
