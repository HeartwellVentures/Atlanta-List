'use client';

import { useState, useEffect } from 'react';
import { supabase, Pro } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ADMIN_PASSWORD = 'atlanta-admin';

export default function AdminPage() {
  const [authorised, setAuthorised] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pros, setPros] = useState<Pro[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.sessionStorage.getItem('atlanta-admin-auth')) {
      setAuthorised(true);
    }
  }, []);

  useEffect(() => {
    if (authorised) loadPros();
  }, [authorised]);

  async function loadPros() {
    const { data } = await supabase.from('pros').select('*');
    setPros((data ?? []) as Pro[]);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      window.sessionStorage.setItem('atlanta-admin-auth', 'yes');
      setAuthorised(true);
      setError('');
    } else {
      setError('Wrong password.');
    }
  }

  async function updatePro(id: string, update: Partial<Pro>) {
    const { error: updateError } = await supabase.from('pros').update(update).eq('id', id);
    if (updateError) setMessage('Update failed: ' + updateError.message);
    else {
      setMessage('Saved.');
      loadPros();
    }
  }

  if (!authorised) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="font-serif text-2xl font-bold">Admin sign-in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Admin access uses a simple password. To change it, edit the pathname constant in the admin page.
        </p>
        <form onSubmit={handleLogin} className="mt-6 space-y-3">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="bg-accent text-accent-foreground hover:opacity-90">
            Continue
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold">Listings</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Pro</th>
              <th className="px-4 py-3 text-left font-semibold">Trade</th>
              <th className="px-4 py-3 text-left font-semibold">Approved</th>
              <th className="px-4 py-3 text-left font-semibold">Tier</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {pros.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.slug}</p>
                </td>
                <td className="px-4 py-2 text-muted-foreground">{p.trade_name}</td>
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={p.approved}
                    onChange={(e) => updatePro(p.id, { approved: e.target.checked })}
                  />
                </td>
                <td className="px-4 py-2">
                  <select
                    value={p.tier}
                    onChange={(e) => updatePro(p.id, { tier: e.target.value as Pro['tier'] })}
                    className="rounded border border-border bg-card px-2 py-1 text-sm"
                  >
                    <option value="free">Free</option>
                    <option value="featured">Featured</option>
                    <option value="premium">Premium</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  <button
                    className="text-xs font-semibold text-accent hover:opacity-80"
                    onClick={() =>
                      updatePro(p.id, { tier: p.tier === 'featured' ? 'free' : 'featured' })
                    }
                  >
                    Toggle featured
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6">
        <button
          className="rounded border border-border px-4 py-2 text-sm hover:bg-secondary"
          onClick={() => {
            window.sessionStorage.removeItem('atlanta-admin-auth');
            setAuthorised(false);
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
