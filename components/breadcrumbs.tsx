import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const schemaItems = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://theatlantalist.com/' },
    ...items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 2,
      name: c.label,
      ...(c.href ? { item: `https://theatlantalist.com${c.href}` } : {}),
    })),
  ];
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: schemaItems,
          }),
        }}
      />
      <ol className="flex flex-wrap items-center gap-1 text-muted-foreground">
        <li>
          <Link href="/" className="hover:text-accent">Home</Link>
        </li>
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5" />
            {c.href ? (
              <Link href={c.href} className="hover:text-accent">{c.label}</Link>
            ) : (
              <span className="text-foreground">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
