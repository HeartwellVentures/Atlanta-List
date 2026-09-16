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
const CLAIM_STATUSES = ['pending', 'approved', 'rejected'];

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

const PRO_FIELDS =
  'id, slug, name, trade_slug, trade_name, tier, approved, rating, review_count, ' +
  'phone, website, address, city, state, zip, neighborhoods, services, hours, ' +
  'review_url, photo_url, description, license_number';

// Nullable text columns the admin may edit.
const NULLABLE_STRING_FIELDS = new Set([
  'website',
  'address',
  'zip',
  'hours',
  'review_url',
  'photo_url',
  'description',
  'license_number',
]);

// Required text columns (NOT NULL in the schema).
const REQUIRED_STRING_FIELDS = new Set(['name', 'slug', 'trade_slug', 'trade_name', 'phone']);

const ARRAY_FIELDS = new Set(['neighborhoods', 'services']);

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

// Build and validate a pros update from the request body. Returns the update
// object, or an error message when a field is unknown or invalid.
function buildProUpdate(raw: Record<string, unknown>): {
  update?: Record<string, unknown>;
  error?: string;
} {
  const update: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (key === 'approved') {
      if (typeof value !== 'boolean') return { error: 'approved must be true or false.' };
      update.approved = value;
      continue;
    }
    if (key === 'tier') {
      if (typeof value !== 'string' || !TIERS.includes(value)) {
        return { error: 'tier must be free, featured, or premium.' };
      }
      update.tier = value;
      continue;
    }
    if (key === 'rating') {
      if (value !== null && (typeof value !== 'number' || value < 0 || value > 5)) {
        return { error: 'rating must be a number from 0 to 5.' };
      }
      update.rating = value;
      continue;
    }
    if (key === 'review_count') {
      if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
        return { error: 'review_count must be a whole number of 0 or more.' };
      }
      update.review_count = value;
      continue;
    }
    if (ARRAY_FIELDS.has(key)) {
      if (!isStringArray(value)) return { error: `${key} must be a list of text.` };
      update[key] = value;
      continue;
    }
    if (REQUIRED_STRING_FIELDS.has(key)) {
      if (typeof value !== 'string' || value.trim().length === 0) {
        return { error: `${key} cannot be empty.` };
      }
      update[key] = value.trim();
      continue;
    }
    if (NULLABLE_STRING_FIELDS.has(key)) {
      if (value !== null && typeof value !== 'string') {
        return { error: `${key} must be text.` };
      }
      update[key] = value === null ? null : value.trim();
      continue;
    }
    if (key === 'city' || key === 'state') {
      if (typeof value !== 'string' || value.trim().length === 0) {
        return { error: `${key} cannot be empty.` };
      }
      update[key] = value.trim();
      continue;
    }
    return { error: `Unknown field: ${key}.` };
  }
  if (Object.keys(update).length === 0) return { error: 'Nothing to update.' };
  return { update };
}

function dbErrorCode(err: unknown): string | null {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as { code?: unknown }).code;
    return typeof code === 'string' ? code : null;
  }
  return null;
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

  let body: {
    password?: string;
    action?: string;
    id?: string;
    approved?: boolean;
    tier?: string;
    fields?: Record<string, unknown>;
    trade?: string;
    approvedOnly?: boolean;
    search?: string;
    status?: string;
    claimId?: string;
    decision?: string;
  };
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
      let query = supabase.from('pros').select(PRO_FIELDS).order('name');
      if (typeof body.trade === 'string' && body.trade.length > 0) {
        query = query.eq('trade_slug', body.trade);
      }
      if (typeof body.tier === 'string' && TIERS.includes(body.tier)) {
        query = query.eq('tier', body.tier);
      }
      if (body.approvedOnly === true) query = query.eq('approved', true);
      if (body.approvedOnly === false) query = query.eq('approved', false);
      if (typeof body.search === 'string' && body.search.trim().length > 0) {
        query = query.ilike('name', `%${body.search.trim()}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return json({ pros: data ?? [] });
    }

    if (body.action === 'update') {
      if (typeof body.id !== 'string' || body.id.length === 0) {
        return json({ error: 'Invalid request.' }, 400);
      }
      // Preferred shape: { action: 'update', id, fields: {...} }.
      // Legacy shape still works: { action: 'update', id, approved, tier }.
      const raw: Record<string, unknown> = {};
      if (body.fields && typeof body.fields === 'object' && !Array.isArray(body.fields)) {
        Object.assign(raw, body.fields);
      }
      if (typeof body.approved === 'boolean' && !('approved' in raw)) raw.approved = body.approved;
      if (typeof body.tier === 'string' && !('tier' in raw)) raw.tier = body.tier;

      const { update, error: validationError } = buildProUpdate(raw);
      if (validationError || !update) {
        return json({ error: validationError ?? 'Invalid request.' }, 400);
      }
      update.updated_at = new Date().toISOString();

      const { error } = await supabase.from('pros').update(update).eq('id', body.id);
      if (error) {
        if (dbErrorCode(error) === '23505') {
          return json({ error: 'That URL slug is already in use.' }, 409);
        }
        throw error;
      }
      return json({ ok: true });
    }

    if (body.action === 'claims') {
      let query = supabase
        .from('claims')
        .select('id, pro_id, business_name, tier, contact_name, email, phone, status, created_at')
        .order('created_at', { ascending: false });
      if (typeof body.status === 'string' && CLAIM_STATUSES.includes(body.status)) {
        query = query.eq('status', body.status);
      }
      const { data, error } = await query;
      if (error) {
        // The claims migration may not be applied yet; treat as an empty queue.
        if (dbErrorCode(error) === '42P01') return json({ claims: [] });
        throw error;
      }
      return json({ claims: data ?? [] });
    }

    if (body.action === 'claim-decision') {
      const claimId = typeof body.claimId === 'string' ? body.claimId : '';
      const decision = typeof body.decision === 'string' ? body.decision : '';
      if (claimId.length === 0 || (decision !== 'approved' && decision !== 'rejected')) {
        return json({ error: 'Invalid request.' }, 400);
      }

      const { data: claim, error: claimError } = await supabase
        .from('claims')
        .select('id, pro_id, tier, status')
        .eq('id', claimId)
        .maybeSingle();
      if (claimError) {
        if (dbErrorCode(claimError) === '42P01') {
          return json({ error: 'Claim not found.' }, 404);
        }
        throw claimError;
      }
      if (!claim) return json({ error: 'Claim not found.' }, 404);

      const { error: statusError } = await supabase
        .from('claims')
        .update({ status: decision })
        .eq('id', claimId);
      if (statusError) throw statusError;

      if (
        decision === 'approved' &&
        claim.pro_id &&
        typeof claim.tier === 'string' &&
        TIERS.includes(claim.tier)
      ) {
        const { error: proError } = await supabase
          .from('pros')
          .update({
            tier: claim.tier,
            approved: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', claim.pro_id);
        if (proError) throw proError;
      }

      return json({ ok: true });
    }

    return json({ error: 'Invalid request.' }, 400);
  } catch (err) {
    console.error('admin-pros failure', err);
    return json({ error: 'Something went wrong.' }, 500);
  }
});
