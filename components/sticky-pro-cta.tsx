'use client';

import { Phone } from 'lucide-react';

/**
 * Sticky mobile call + quote bar for pro pages.
 * Borrowed from Yelp/Thumbtack's persistent mobile CTAs: on a phone, the two
 * actions a homeowner wants are always one tap away, no scrolling back up.
 */
export function StickyProCta({ phone, proName }: { phone: string; proName: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
      <div
        className="mx-auto grid max-w-4xl grid-cols-2 gap-3 px-4 pt-3"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <a
          href={`tel:${phone}`}
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold"
        >
          <Phone className="h-4 w-4" />
          Call {proName.split(' ')[0]}
        </a>
        <a
          href="#quote"
          className="flex items-center justify-center rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground"
        >
          Request a quote
        </a>
      </div>
    </div>
  );
}
