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
    const name = String(form.get('name') || '').trim();
    const email = String(form.get('email') || '').trim();
    const phone = String(form.get('phone') || '').trim();
    const message = String(form.get('message') || '').trim();
    if (!name || !email || !message) {
      setError('Please fill in your name, email, and a short description of the job.');
      setLoading(false);
      return;
    }
    if (name.length > 120 || email.length > 200 || phone.length > 40 || message.length > 5000) {
      setError('Please shorten your details. The job description can be up to 5000 characters.');
      setLoading(false);
      return;
    }
    const { error: insertError } = await supabase.from('inquiries').insert({
      pro_id: proId,
      name,
      email,
      phone: phone || null,
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
      <Input name="name" placeholder="Your name" maxLength={120} required />
      <Input name="email" type="email" placeholder="Email" maxLength={200} required />
      <Input name="phone" type="tel" placeholder="Phone (optional)" maxLength={40} />
      <Textarea
        name="message"
        placeholder="Describe the job (e.g. leaks under kitchen sink)"
        maxLength={5000}
        required
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading} className="bg-accent text-accent-foreground hover:opacity-90">
        {loading ? 'Sending...' : `Request quote from ${proName}`}
      </Button>
    </form>
  );
}
