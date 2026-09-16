import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, X-Client-Info, Apikey',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function hashMatches(candidate: string, expected: string): boolean {
  if (candidate.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < candidate.length; i++) {
    diff |= candidate.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

const TIERS = ['free', 'featured', 'premium'];
const CLAIM_STATUSES = ['pending', 'approved', 'rejected'];

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

const attempts = new Map<string, { count: number; until: number }>();

function callerKey(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for') ?? '';
  return forwarded.split(',')[0].trim() || 'unknown';
}

function lockedOut(key: string): boolean {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (Date.now() > entry.until) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(key: string): void {
  const entry = attempts.get(key);
  if (entry && Date.now() <= entry.until) {
    entry.count += 1;
    entry.until = Date.now() + LOCKOUT_MS;
    return;
  }
  attempts.set(key, { count: 1, until: Date.now() + LOCKOUT_MS });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data: setting, error: settingError } = await supabase
    .from('admin_settings')
    .select('value')
    .eq('key', 'admin_password')
    .maybeSingle();

  if (settingError || !setting?.value) {
    return json({ error: 'Admin access is not configured.' }, 503);
  }

  const storedHash = setting.value;

  const key = callerKey(req);
  if (lockedOut(key)) {
    return json({ error: 'Too many attempts. Try again later.' }, 429);
  }

  let body: {
    password?: string;
    action?: string;
    id?: string;
    fields?: Record<string, unknown>;
    claimId?: string;
    decision?: string;
    new_password?: string;
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  const supplied = typeof body.password === 'string' ? body.password : '';
  const suppliedHash = await sha256(supplied);

  if (!hashMatches(suppliedHash, storedHash)) {
    recordFailure(key);
    await new Promise((resolve) => setTimeout(resolve, 750));
    return json({ error: 'Not authorised.' }, 401);
  }
  attempts.delete(key);

  try {
    if (body.action === 'list') {
      const { data, error } = await supabase
        .from('pros')
        .select('*')
        .order('name');
      if (error) throw error;
      return json({ pros: data ?? [] });
    }

    if (body.action === 'claims') {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return json({ claims: data ?? [] });
    }

    if (body.action === 'update') {
      if (typeof body.id !== 'string' || body.id.length === 0) {
        return json({ error: 'Invalid request.' }, 400);
      }
      if (!body.fields || typeof body.fields !== 'object') {
        return json({ error: 'Invalid request.' }, 400);
      }
      const fields = body.fields;
      if (typeof fields.tier === 'string' && !TIERS.includes(fields.tier)) {
        return json({ error: 'Invalid request.' }, 400);
      }
      const { error } = await supabase.from('pros').update(fields).eq('id', body.id);
      if (error) throw error;
      return json({ ok: true });
    }

    if (body.action === 'claim-decision') {
      if (typeof body.claimId !== 'string' || body.claimId.length === 0) {
        return json({ error: 'Invalid request.' }, 400);
      }
      if (typeof body.decision !== 'string' || !CLAIM_STATUSES.includes(body.decision)) {
        return json({ error: 'Invalid request.' }, 400);
      }

      const { data: claim, error: claimError } = await supabase
        .from('claims')
        .select('*')
        .eq('id', body.claimId)
        .maybeSingle();
      if (claimError) throw claimError;
      if (!claim) return json({ error: 'Claim not found.' }, 404);

      const { error: updateClaimError } = await supabase
        .from('claims')
        .update({ status: body.decision })
        .eq('id', body.claimId);
      if (updateClaimError) throw updateClaimError;

      if (body.decision === 'approved' && claim.pro_id) {
        const { error: proError } = await supabase
          .from('pros')
          .update({ tier: claim.tier, approved: true })
          .eq('id', claim.pro_id);
        if (proError) throw proError;
      }

      return json({ ok: true });
    }

    if (body.action === 'change_password') {
      if (typeof body.new_password !== 'string' || body.new_password.length < 12) {
        return json({ error: 'Password must be at least 12 characters.' }, 400);
      }
      const newHash = await sha256(body.new_password);
      const { error } = await supabase
        .from('admin_settings')
        .update({ value: newHash, updated_at: new Date().toISOString() })
        .eq('key', 'admin_password');
      if (error) throw error;
      return json({ ok: true });
    }

    return json({ error: 'Invalid request.' }, 400);
  } catch (err) {
    console.error('admin-pros failure', err);
    return json({ error: 'Something went wrong.' }, 500);
  }
});
