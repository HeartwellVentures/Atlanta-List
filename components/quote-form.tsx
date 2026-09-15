'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function QuoteForm({ proId, proName }: { proId: string; proName: string }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const name = String(form.get('name') || '');
    const email = String(form.get('email') || '');
    const phone = String(form.get('phone') || '');
    const message = String(form.get('message') || '');
    if (!name || !email || !message) {
      setError('Please fill in your name, email, and a short description of the job.');
      setLoading(false);
      return;
    }
    const { error: insertError } = await supabase.from('inquiries').insert({
      pro_id: proId,
      name,
      email,
      phone,
      message,
    });
    setLoading(false);
    if (insertError) {
      setError('Something went wrong. Please try again.');
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-border bg-secondary p-5 text-sm">
        <p className="font-semibold">Request sent to {proName}.</p>
        <p className="mt-1 text-muted-foreground">
          They will reach out directly. The Atlanta List never sells or shares inquiry leads.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="name" placeholder="Your name" required />
      <Input name="email" type="email" placeholder="Email" required />
      <Input name="phone" type="tel" placeholder="Phone (optional)" />
      <Textarea name="message" placeholder="Describe the job (e.g. leaks under kitchen sink)" required />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading} className="bg-accent text-accent-foreground hover:opacity-90">
        {loading ? 'Sending...' : `Request quote from ${proName}`}
      </Button>
    </form>
  );
}
