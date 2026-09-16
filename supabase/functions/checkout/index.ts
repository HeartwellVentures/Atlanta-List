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

const TIERS = ['free', 'featured', 'premium'] as const;
type Tier = (typeof TIERS)[number];

interface ClaimRequest {
  proSlug?: unknown;
  businessName?: unknown;
  trade?: unknown;
  tier?: unknown;
  contactName?: unknown;
  email?: unknown;
  phone?: unknown;
}

const MAX = {
  businessName: 200,
  trade: 60,
  contactName: 120,
  email: 200,
  phone: 40,
  slug: 200,
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function str(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  let body: ClaimRequest;
  try {
    body = (await req.json()) as ClaimRequest;
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  // --- Validation (server-side; client checks are only a convenience) ---
  const tier = typeof body.tier === 'string' ? body.tier.trim().toLowerCase() : '';
  if (!(TIERS as readonly string[]).includes(tier)) {
    return json({ error: 'Please choose a membership tier: free, featured, or premium.' }, 400);
  }

  const contactName = str(body.contactName, MAX.contactName);
  if (!contactName) {
    return json({ error: 'Please provide your name.' }, 400);
  }

  const email = str(body.email, MAX.email);
  if (!email || !EMAIL_RE.test(email)) {
    return json({ error: 'Please provide a valid email address.' }, 400);
  }

  const phone = str(body.phone, MAX.phone); // optional

  const proSlug = str(body.proSlug, MAX.slug); // optional

  // trade is accepted for new-listing requests (admin context) but is not
  // persisted by the current claims schema; validated here for forward
  // compatibility with a future trade column.
  if (
    body.trade !== undefined &&
    body.trade !== null &&
    !str(body.trade, MAX.trade)
  ) {
    return json({ error: 'Please choose a trade.' }, 400);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // --- Resolve the pro, when claiming an existing listing ---
  let proId: string | null = null;
  let businessName = str(body.businessName, MAX.businessName);

  if (proSlug) {
    const { data: pro, error: proError } = await supabase
      .from('pros')
      .select('id, name, approved')
      .eq('slug', proSlug)
      .single();
    if (proError || !pro) {
      return json({ error: 'We could not find that listing.' }, 404);
    }
    if (!pro.approved) {
      return json({ error: 'That listing is not available to claim.' }, 404);
    }
    proId = pro.id;
    businessName = businessName ?? pro.name;
  }

  if (!businessName) {
    return json({ error: 'Please provide your business name.' }, 400);
  }

  // --- Store the claim as pending; the admin approves it in the dashboard ---
  const { error: insertError } = await supabase.from('claims').insert({
    pro_id: proId,
    business_name: businessName,
    tier: tier as Tier,
    contact_name: contactName,
    email,
    phone,
  });

  if (insertError) {
    console.error('claim insert failure', insertError);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }

  // ------------------------------------------------------------------
  // STRIPE EXTENSION POINT
  // If STRIPE_SECRET_KEY is set in the future, paid tiers (featured,
  // premium) should create a Stripe Checkout Session here and return its
  // URL so the browser can redirect. Until then every claim stays
  // pending and the admin completes membership setup manually.
  // ------------------------------------------------------------------

  return json({
    ok: true,
    pending: true,
    message: 'Claim received. We will email you to complete membership setup.',
  });
});
