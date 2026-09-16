/** Canonical public URL of the deployed site.
 * theatlantalist.com does not resolve yet; when a real domain goes live,
 * point NEXT_PUBLIC_SITE_URL at it instead of editing code. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://atlantalist.netlify.app';
