'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AdminPro {
  id: string;
  slug: string;
  name: string;
  trade_name: string;
  tier: 'free' | 'featured' | 'premium';
  approved: boolean;
}

const endpoint = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-pros`;

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authorised, setAuthorised] = useState(false);
  const [error, setError] = useState('');
  const [pros, setPros] = useState<AdminPro[]>([]);
  const [message, setMessage] = useState('');

  async function callAdmin(payload: Record<string, unknown>) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''}`,
      },
      body: JSON.stringify({ ...payload, password }),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data } as {
      ok: boolean;
      status: number;
      data: { pros?: AdminPro[]; error?: string };
    };
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const { ok, status, data } = await callAdmin({ action: 'list' });
    if (ok) {
      setPros(data.pros ?? []);
      setAuthorised(true);
    } else if (status === 503) {
      setError(
        'Admin access has not been set up yet. Add an ADMIN_PASSWORD secret to the project, then try again.'
      );
    } else {
      setError('Wrong password.');
    }
  }

  async function refresh() {
    const { ok, data } = await callAdmin({ action: 'list' });
    if (ok) setPros(data.pros ?? []);
  }

  async function updatePro(id: string, update: Partial<Pick<AdminPro, 'approved' | 'tier'>>) {
    const { ok } = await callAdmin({ action: 'update', id, ...update });
    if (!ok) {
      setMessage('Could not save that change.');
      return;
    }
    setMessage('Saved.');
    refresh();
  }

  if (!authorised) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="font-serif text-2xl font-bold">Admin sign-in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Admin access is checked on the server. The password is stored as a project secret named
          ADMIN_PASSWORD.
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
                    onChange={(e) => updatePro(p.id, { tier: e.target.value as AdminPro['tier'] })}
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
            setPassword('');
            setPros([]);
            setAuthorised(false);
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
