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

// Constant-time-ish comparison so the response timing does not leak the password.
function passwordMatches(candidate: string, expected: string): boolean {
  if (candidate.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < candidate.length; i++) {
    diff |= candidate.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

const TIERS = ['free', 'featured', 'premium'];

const MIN_PASSWORD_LENGTH = 12;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

// Simple per-caller throttle so the shared password cannot be guessed in bulk.
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

  const adminPassword = Deno.env.get('ADMIN_PASSWORD');
  if (!adminPassword || adminPassword.length < MIN_PASSWORD_LENGTH) {
    // Fail closed: no administrative access until a sufficiently long
    // ADMIN_PASSWORD secret is set.
    return json({ error: 'Admin access is not configured.' }, 503);
  }

  const key = callerKey(req);
  if (lockedOut(key)) {
    return json({ error: 'Too many attempts. Try again later.' }, 429);
  }

  let body: { password?: string; action?: string; id?: string; approved?: boolean; tier?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  const supplied = typeof body.password === 'string' ? body.password : '';
  if (!passwordMatches(supplied, adminPassword)) {
    recordFailure(key);
    // Fixed delay to slow down automated guessing.
    await new Promise((resolve) => setTimeout(resolve, 750));
    return json({ error: 'Not authorised.' }, 401);
  }
  attempts.delete(key);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    if (body.action === 'list') {
      const { data, error } = await supabase
        .from('pros')
        .select('id, slug, name, trade_name, tier, approved')
        .order('name');
      if (error) throw error;
      return json({ pros: data ?? [] });
    }

    if (body.action === 'update') {
      if (typeof body.id !== 'string' || body.id.length === 0) {
        return json({ error: 'Invalid request.' }, 400);
      }
      const update: Record<string, unknown> = {};
      if (typeof body.approved === 'boolean') update.approved = body.approved;
      if (typeof body.tier === 'string') {
        if (!TIERS.includes(body.tier)) return json({ error: 'Invalid request.' }, 400);
        update.tier = body.tier;
      }
      if (Object.keys(update).length === 0) {
        return json({ error: 'Invalid request.' }, 400);
      }
      const { error } = await supabase.from('pros').update(update).eq('id', body.id);
      if (error) throw error;
      return json({ ok: true });
    }

    return json({ error: 'Invalid request.' }, 400);
  } catch (err) {
    console.error('admin-pros failure', err);
    return json({ error: 'Something went wrong.' }, 500);
  }
});
