import Link from 'next/link';
import { Wrench } from 'lucide-react';
import { trades } from '@/lib/trades';

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Wrench className="h-5 w-5" />
          </span>
          <span className="font-serif text-xl font-semibold tracking-tight">
            The Atlanta List
          </span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/trades" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Trades
          </Link>
          <Link href="/areas" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Neighborhoods
          </Link>
          <Link href="/quiz" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Match Quiz
          </Link>
          <Link href="/for-pros" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            For Pros
          </Link>
          <Link
            href="/for-pros#claim"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
          >
            Claim a listing
          </Link>
        </nav>
        <Link
          href="/for-pros"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground md:hidden"
        >
          For Pros
        </Link>
      </div>
    </header>
  );
}
