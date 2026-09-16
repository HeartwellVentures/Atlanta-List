/**
 * Typed client for the claim/checkout edge function.
 * Claims are stored as pending; the admin completes membership setup.
 */

export type ClaimTier = 'free' | 'featured' | 'premium';

export interface ClaimRequest {
  /** Slug of the pro being claimed. Omit for new-listing requests. */
  proSlug?: string;
  /** Required when proSlug is omitted; defaults to the pro name otherwise. */
  businessName?: string;
  /** Trade for new-listing requests (validated, not yet persisted). */
  trade?: string;
  tier: ClaimTier;
  contactName: string;
  email: string;
  phone?: string;
}

export interface ClaimResult {
  ok: boolean;
  pending: boolean;
  message: string;
}

export async function submitClaim(req: ClaimRequest): Promise<ClaimResult> {
  const endpoint = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/checkout`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok || !data || data.ok !== true) {
    throw new Error(data?.error || 'Something went wrong. Please try again.');
  }
  return data as ClaimResult;
}
