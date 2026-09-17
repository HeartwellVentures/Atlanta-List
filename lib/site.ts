/** Canonical public URL of the deployed site.
 * theatlantalist.com does not resolve yet; when a real domain goes live,
 * point NEXT_PUBLIC_SITE_URL at it instead of editing code. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://atlantalist.netlify.app';

/** Provenance label for directory data. Seed records were assembled from
 *  public sources (company websites, review platforms, best-of lists) with
 *  phone numbers, addresses, and star ratings confirmed against those
 *  sources; aggregate ratings are intentionally coarse and each profile
 *  links to the live review page. Bump this when the dataset is re-verified. */
export const DATA_VERIFIED_LABEL = 'September 2026';
