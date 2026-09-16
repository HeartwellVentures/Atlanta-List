'use client';

import { useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { X } from 'lucide-react';

type Tier = 'free' | 'featured' | 'premium';
type ClaimStatus = 'pending' | 'approved' | 'rejected';

interface AdminPro {
  id: string;
  slug: string;
  name: string;
  trade_slug: string;
  trade_name: string;
  tier: Tier;
  approved: boolean;
  rating: number | null;
  review_count: number;
  phone: string;
  website: string | null;
  address: string | null;
  city: string;
  state: string;
  zip: string | null;
  neighborhoods: string[];
  services: string[];
  hours: string | null;
  review_url: string | null;
  photo_url: string | null;
  description: string | null;
  license_number: string | null;
}

interface Claim {
  id: string;
  pro_id: string | null;
  business_name: string;
  tier: Tier;
  contact_name: string;
  email: string;
  phone: string | null;
  status: ClaimStatus;
  created_at: string;
}

interface ProDraft {
  name: string;
  slug: string;
  trade_slug: string;
  trade_name: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  neighborhoods: string[];
  services: string[];
  hours: string;
  rating: string;
  review_count: string;
  review_url: string;
  photo_url: string;
  description: string;
  license_number: string;
  tier: Tier;
  approved: boolean;
}

const endpoint = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-pros`;

function draftFromPro(p: AdminPro): ProDraft {
  return {
    name: p.name,
    slug: p.slug,
    trade_slug: p.trade_slug,
    trade_name: p.trade_name,
    phone: p.phone,
    website: p.website ?? '',
    address: p.address ?? '',
    city: p.city,
    state: p.state,
    zip: p.zip ?? '',
    neighborhoods: [...(p.neighborhoods ?? [])],
    services: [...(p.services ?? [])],
    hours: p.hours ?? '',
    rating: p.rating === null || p.rating === undefined ? '' : String(p.rating),
    review_count: String(p.review_count ?? 0),
    review_url: p.review_url ?? '',
    photo_url: p.photo_url ?? '',
    description: p.description ?? '',
    license_number: p.license_number ?? '',
    tier: p.tier,
    approved: p.approved,
  };
}

function validateDraft(d: ProDraft): string[] {
  const errs: string[] = [];
  if (!d.name.trim()) errs.push('Name is required.');
  if (!d.slug.trim()) {
    errs.push('URL slug is required.');
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(d.slug.trim())) {
    errs.push('URL slug must be lowercase letters, numbers, and hyphens only.');
  }
  if (!d.trade_slug.trim()) errs.push('Trade slug is required.');
  if (!d.trade_name.trim()) errs.push('Trade name is required.');
  if (!d.phone.trim()) errs.push('Phone is required.');
  if (d.rating.trim() !== '') {
    const r = Number(d.rating);
    if (!Number.isFinite(r) || r < 0 || r > 5) {
      errs.push('Rating must be a number from 0 to 5, or blank.');
    }
  }
  if (d.review_count.trim() !== '') {
    const n = Number(d.review_count);
    if (!Number.isInteger(n) || n < 0) {
      errs.push('Review count must be a whole number of 0 or more.');
    }
  }
  const urlFields: Array<[string, string]> = [
    ['Website', d.website],
    ['Review URL', d.review_url],
    ['Photo URL', d.photo_url],
  ];
  for (const [label, value] of urlFields) {
    if (value.trim() !== '' && !/^https?:\/\//i.test(value.trim())) {
      errs.push(`${label} must start with http:// or https://.`);
    }
  }
  return errs;
}

function TagInput({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  label: string;
}) {
  const [text, setText] = useState('');
  function add() {
    const parts = text
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    const next = [...value];
    for (const part of parts) {
      if (!next.some((v) => v.toLowerCase() === part.toLowerCase())) next.push(part);
    }
    onChange(next);
    setText('');
  }
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 py-1">
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              className="rounded-full hover:text-destructive"
              onClick={() => onChange(value.filter((v) => v !== tag))}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder ?? `Add ${label.toLowerCase()}, press Enter`}
          aria-label={label}
        />
        <Button type="button" variant="outline" onClick={add}>
          Add
        </Button>
      </div>
    </div>
  );
}

function PhotoPreview({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  if (!url.trim() || failed) return null;
  return (
    <img
      src={url.trim()}
      alt="Listing photo preview"
      className="mt-2 h-24 w-24 rounded-lg border border-border object-cover"
      onError={() => setFailed(true)}
    />
  );
}

function tierBadge(tier: Tier) {
  if (tier === 'premium') return <Badge variant="default">Premium</Badge>;
  if (tier === 'featured') return <Badge variant="secondary">Featured</Badge>;
  return <Badge variant="outline">Free</Badge>;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authorised, setAuthorised] = useState(false);
  const [error, setError] = useState('');
  const [pros, setPros] = useState<AdminPro[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [tradeFilter, setTradeFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [approvedFilter, setApprovedFilter] = useState('all');
  const [claimStatusFilter, setClaimStatusFilter] = useState('pending');

  const [editing, setEditing] = useState<AdminPro | null>(null);
  const [draft, setDraft] = useState<ProDraft | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const [claimDialog, setClaimDialog] = useState<{
    claim: Claim;
    decision: 'approved' | 'rejected';
  } | null>(null);
  const [deciding, setDeciding] = useState(false);

  const noticeTimer = useRef<number | null>(null);
  function flash(message: string) {
    setNotice(message);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(''), 4000);
  }

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
      data: { pros?: AdminPro[]; claims?: Claim[]; error?: string; ok?: boolean };
    };
  }

  async function loadPros() {
    const { ok, data } = await callAdmin({ action: 'list' });
    if (ok) setPros(data.pros ?? []);
  }

  async function loadClaims() {
    const { ok, data } = await callAdmin({ action: 'claims' });
    if (ok) setClaims(data.claims ?? []);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { ok, status } = await callAdmin({ action: 'list' });
    if (ok) {
      await Promise.all([loadPros(), loadClaims()]);
      setAuthorised(true);
    } else if (status === 503) {
      setError('Admin access has not been set up yet.');
    } else {
      setError('Wrong password.');
    }
    setLoading(false);
  }

  async function updatePro(id: string, fields: Record<string, unknown>) {
    const { ok, data } = await callAdmin({ action: 'update', id, fields });
    if (!ok) {
      flash(data.error ?? 'Could not save that change.');
      return;
    }
    flash('Saved.');
    await loadPros();
  }

  function openEditor(pro: AdminPro) {
    setEditing(pro);
    setDraft(draftFromPro(pro));
    setFormErrors([]);
  }

  function closeEditor() {
    setEditing(null);
    setDraft(null);
    setFormErrors([]);
  }

  function setDraftField<K extends keyof ProDraft>(key: K, value: ProDraft[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  }

  async function saveDraft() {
    if (!editing || !draft) return;
    const errs = validateDraft(draft);
    setFormErrors(errs);
    if (errs.length > 0) return;
    setSaving(true);
    const t = (v: string) => v.trim();
    const nullIfEmpty = (v: string) => (v.trim() === '' ? null : v.trim());
    const fields: Record<string, unknown> = {
      name: t(draft.name),
      slug: t(draft.slug),
      trade_slug: t(draft.trade_slug),
      trade_name: t(draft.trade_name),
      phone: t(draft.phone),
      website: nullIfEmpty(draft.website),
      address: nullIfEmpty(draft.address),
      city: t(draft.city) || 'Atlanta',
      state: t(draft.state) || 'GA',
      zip: nullIfEmpty(draft.zip),
      neighborhoods: draft.neighborhoods,
      services: draft.services,
      hours: nullIfEmpty(draft.hours),
      rating: draft.rating.trim() === '' ? null : Number(draft.rating),
      review_count: draft.review_count.trim() === '' ? 0 : parseInt(draft.review_count, 10),
      review_url: nullIfEmpty(draft.review_url),
      photo_url: nullIfEmpty(draft.photo_url),
      description: nullIfEmpty(draft.description),
      license_number: nullIfEmpty(draft.license_number),
      tier: draft.tier,
      approved: draft.approved,
    };
    const { ok, data } = await callAdmin({ action: 'update', id: editing.id, fields });
    setSaving(false);
    if (!ok) {
      setFormErrors([data.error ?? 'Could not save that change.']);
      return;
    }
    flash('Listing saved.');
    closeEditor();
    await loadPros();
  }

  async function decideClaim() {
    if (!claimDialog) return;
    setDeciding(true);
    const { ok, data } = await callAdmin({
      action: 'claim-decision',
      claimId: claimDialog.claim.id,
      decision: claimDialog.decision,
    });
    setDeciding(false);
    if (!ok) {
      flash(data.error ?? 'Could not update that claim.');
      setClaimDialog(null);
      return;
    }
    flash(
      claimDialog.decision === 'approved'
        ? 'Claim approved. Tier applied to the listing.'
        : 'Claim rejected.'
    );
    setClaimDialog(null);
    await Promise.all([loadClaims(), loadPros()]);
  }

  const trades = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of pros) map.set(p.trade_slug, p.trade_name);
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [pros]);

  const filteredPros = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pros.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (tradeFilter !== 'all' && p.trade_slug !== tradeFilter) return false;
      if (tierFilter !== 'all' && p.tier !== tierFilter) return false;
      if (approvedFilter === 'approved' && !p.approved) return false;
      if (approvedFilter === 'unapproved' && p.approved) return false;
      return true;
    });
  }, [pros, search, tradeFilter, tierFilter, approvedFilter]);

  const stats = useMemo(() => {
    const byTier: Record<Tier, number> = { free: 0, featured: 0, premium: 0 };
    const byTrade = new Map<string, { name: string; count: number }>();
    let approved = 0;
    for (const p of pros) {
      byTier[p.tier] = (byTier[p.tier] ?? 0) + 1;
      if (p.approved) approved += 1;
      const entry = byTrade.get(p.trade_slug) ?? { name: p.trade_name, count: 0 };
      entry.count += 1;
      byTrade.set(p.trade_slug, entry);
    }
    return {
      total: pros.length,
      approved,
      pendingClaims: claims.filter((c) => c.status === 'pending').length,
      byTier,
      byTrade: Array.from(byTrade.values()).sort((a, b) => b.count - a.count),
    };
  }, [pros, claims]);

  const qaList = useMemo(() => {
    return pros
      .map((p) => {
        const flags: string[] = [];
        if (!p.address?.trim() || !p.zip?.trim()) flags.push('No address');
        if (!p.photo_url?.trim()) flags.push('No photo');
        if (!p.review_url?.trim()) flags.push('No review link');
        if ((p.neighborhoods ?? []).length === 0) flags.push('No service areas');
        return { pro: p, flags };
      })
      .filter((row) => row.flags.length > 0);
  }, [pros]);

  const visibleClaims = useMemo(() => {
    if (claimStatusFilter === 'all') return claims;
    return claims.filter((c) => c.status === claimStatusFilter);
  }, [claims, claimStatusFilter]);

  function signOut() {
    setPassword('');
    setPros([]);
    setClaims([]);
    setAuthorised(false);
    setError('');
    setNotice('');
  }

  if (!authorised) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="font-serif text-2xl font-bold">Admin sign-in</h1>
        <p className="mt-2 text-sm text-muted-foreground">Admin access is restricted.</p>
        <form onSubmit={handleLogin} className="mt-6 space-y-3">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            className="bg-accent text-accent-foreground hover:opacity-90"
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Continue'}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-bold">Admin</h1>
        <div className="flex items-center gap-3">
          {notice && <p className="text-sm text-muted-foreground">{notice}</p>}
          <button
            className="rounded border border-border px-4 py-2 text-sm hover:bg-secondary"
            onClick={signOut}
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.approved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Pending claims
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.pendingClaims}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">Free</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.byTier.free}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">Featured</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.byTier.featured}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">Premium</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.byTier.premium}</p>
          </CardContent>
        </Card>
      </div>

      {stats.byTrade.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {stats.byTrade.map((t) => (
            <Badge key={t.name} variant="secondary">
              {t.name}: {t.count}
            </Badge>
          ))}
        </div>
      )}

      <Tabs defaultValue="listings" className="mt-8">
        <TabsList>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="claims">
            Claim queue
            {stats.pendingClaims > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.pendingClaims}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="qa">
            Content QA
            {qaList.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {qaList.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by business name"
              aria-label="Search by business name"
            />
            <Select value={tradeFilter} onValueChange={setTradeFilter}>
              <SelectTrigger aria-label="Filter by trade">
                <SelectValue placeholder="All trades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All trades</SelectItem>
                {trades.map(([slug, name]) => (
                  <SelectItem key={slug} value={slug}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger aria-label="Filter by tier">
                <SelectValue placeholder="All tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tiers</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
            <Select value={approvedFilter} onValueChange={setApprovedFilter}>
              <SelectTrigger aria-label="Filter by approval">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Approved and unapproved</SelectItem>
                <SelectItem value="approved">Approved only</SelectItem>
                <SelectItem value="unapproved">Unapproved only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Showing {filteredPros.length} of {pros.length} listings.
          </p>

          <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pro</TableHead>
                  <TableHead>Trade</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead className="text-right">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPros.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.slug}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.trade_name}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {p.rating === null || p.rating === undefined
                        ? 'n/a'
                        : `${p.rating} (${p.review_count})`}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={p.approved}
                        onCheckedChange={(checked) => updatePro(p.id, { approved: checked })}
                        aria-label={`Approved: ${p.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={p.tier}
                        onValueChange={(value) => updatePro(p.id, { tier: value })}
                      >
                        <SelectTrigger className="w-32" aria-label={`Tier: ${p.name}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="featured">Featured</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => openEditor(p)}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPros.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No listings match these filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="claims" className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Approving a claim applies the requested tier to the linked listing and marks it
              approved.
            </p>
            <Select value={claimStatusFilter} onValueChange={setClaimStatusFilter}>
              <SelectTrigger className="w-44" aria-label="Filter claims by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 space-y-3">
            {visibleClaims.map((claim) => (
              <Card key={claim.id}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{claim.business_name}</p>
                      {tierBadge(claim.tier)}
                      {claim.status !== 'pending' && (
                        <Badge variant={claim.status === 'approved' ? 'secondary' : 'outline'}>
                          {claim.status}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {claim.contact_name} &lt;{claim.email}&gt;
                      {claim.phone ? `, ${claim.phone}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(claim.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      {claim.pro_id ? ' (linked to existing listing)' : ' (no linked listing)'}
                    </p>
                  </div>
                  {claim.status === 'pending' && (
                    <div className="flex shrink-0 gap-2">
                      <Button
                        size="sm"
                        onClick={() => setClaimDialog({ claim, decision: 'approved' })}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setClaimDialog({ claim, decision: 'rejected' })}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {visibleClaims.length === 0 && (
              <p className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                No claims in this state.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="qa" className="mt-6">
          <p className="text-sm text-muted-foreground">
            Listings missing content that buyers expect. Work through these to raise directory
            quality.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pro</TableHead>
                  <TableHead>Missing</TableHead>
                  <TableHead className="text-right">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qaList.map(({ pro, flags }) => (
                  <TableRow key={pro.id}>
                    <TableCell>
                      <p className="font-semibold">{pro.name}</p>
                      <p className="text-xs text-muted-foreground">{pro.trade_name}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {flags.map((flag) => (
                          <Badge key={flag} variant="destructive">
                            {flag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => openEditor(pro)}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {qaList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                      Every listing has an address, photo, review link, and service areas. Nice.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Sheet
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) closeEditor();
        }}
      >
        <SheetContent className="w-[92vw] overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Edit listing</SheetTitle>
            <SheetDescription>
              {editing ? `${editing.name} (${editing.slug})` : ''}
            </SheetDescription>
          </SheetHeader>
          {draft && (
            <div className="mt-6 space-y-6">
              {formErrors.length > 0 && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                  {formErrors.map((err) => (
                    <p key={err} className="text-sm text-destructive">
                      {err}
                    </p>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Basics</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-name">Business name</Label>
                    <Input
                      id="edit-name"
                      value={draft.name}
                      onChange={(e) => setDraftField('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-slug">URL slug</Label>
                    <Input
                      id="edit-slug"
                      value={draft.slug}
                      onChange={(e) => setDraftField('slug', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-trade-slug">Trade slug</Label>
                    <Input
                      id="edit-trade-slug"
                      value={draft.trade_slug}
                      onChange={(e) => setDraftField('trade_slug', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-trade-name">Trade name</Label>
                    <Input
                      id="edit-trade-name"
                      value={draft.trade_name}
                      onChange={(e) => setDraftField('trade_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-tier">Tier</Label>
                    <Select
                      value={draft.tier}
                      onValueChange={(v) => setDraftField('tier', v as Tier)}
                    >
                      <SelectTrigger id="edit-tier">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2 pb-2">
                    <Switch
                      id="edit-approved"
                      checked={draft.approved}
                      onCheckedChange={(v) => setDraftField('approved', v)}
                    />
                    <Label htmlFor="edit-approved">Approved (visible on site)</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Contact</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-phone">Phone</Label>
                    <Input
                      id="edit-phone"
                      value={draft.phone}
                      onChange={(e) => setDraftField('phone', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-website">Website</Label>
                    <Input
                      id="edit-website"
                      value={draft.website}
                      onChange={(e) => setDraftField('website', e.target.value)}
                      placeholder="https://"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="edit-address">Street address</Label>
                    <Input
                      id="edit-address"
                      value={draft.address}
                      onChange={(e) => setDraftField('address', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-city">City</Label>
                    <Input
                      id="edit-city"
                      value={draft.city}
                      onChange={(e) => setDraftField('city', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-state">State</Label>
                      <Input
                        id="edit-state"
                        value={draft.state}
                        onChange={(e) => setDraftField('state', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-zip">ZIP</Label>
                      <Input
                        id="edit-zip"
                        value={draft.zip}
                        onChange={(e) => setDraftField('zip', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="edit-hours">Hours</Label>
                    <Input
                      id="edit-hours"
                      value={draft.hours}
                      onChange={(e) => setDraftField('hours', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Reviews</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-rating">Rating (0 to 5)</Label>
                    <Input
                      id="edit-rating"
                      value={draft.rating}
                      onChange={(e) => setDraftField('rating', e.target.value)}
                      inputMode="decimal"
                      placeholder="4.8"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-review-count">Review count</Label>
                    <Input
                      id="edit-review-count"
                      value={draft.review_count}
                      onChange={(e) => setDraftField('review_count', e.target.value)}
                      inputMode="numeric"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="edit-review-url">Review URL</Label>
                    <Input
                      id="edit-review-url"
                      value={draft.review_url}
                      onChange={(e) => setDraftField('review_url', e.target.value)}
                      placeholder="https://"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Photo and details</h3>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-photo-url">Photo URL</Label>
                  <Input
                    id="edit-photo-url"
                    value={draft.photo_url}
                    onChange={(e) => setDraftField('photo_url', e.target.value)}
                    placeholder="https://"
                  />
                  <PhotoPreview url={draft.photo_url} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={draft.description}
                    onChange={(e) => setDraftField('description', e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-license">License number</Label>
                  <Input
                    id="edit-license"
                    value={draft.license_number}
                    onChange={(e) => setDraftField('license_number', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Service areas</h3>
                <TagInput
                  label="Service areas"
                  value={draft.neighborhoods}
                  onChange={(v) => setDraftField('neighborhoods', v)}
                  placeholder="e.g. Buckhead, press Enter"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Services</h3>
                <TagInput
                  label="Services"
                  value={draft.services}
                  onChange={(v) => setDraftField('services', v)}
                  placeholder="e.g. Drain cleaning, press Enter"
                />
              </div>

              <SheetFooter className="gap-2">
                <Button variant="outline" onClick={closeEditor} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={saveDraft} disabled={saving}>
                  {saving ? 'Saving...' : 'Save listing'}
                </Button>
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={claimDialog !== null} onOpenChange={(open) => !open && setClaimDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {claimDialog?.decision === 'approved' ? 'Approve this claim?' : 'Reject this claim?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {claimDialog?.decision === 'approved'
                ? `The ${claimDialog.claim.business_name} listing will be marked approved and moved to the ${claimDialog.claim.tier} tier.`
                : `${claimDialog?.claim.business_name} will keep its current tier. The claimant is not notified automatically.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deciding}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={decideClaim} disabled={deciding}>
              {deciding
                ? 'Working...'
                : claimDialog?.decision === 'approved'
                  ? 'Approve claim'
                  : 'Reject claim'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
