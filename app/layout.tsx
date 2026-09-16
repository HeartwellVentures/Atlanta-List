import './globals.css';
import type { Metadata } from 'next';
import { Source_Serif_4, Source_Sans_3 } from 'next/font/google';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

const serif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const sans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://theatlantalist.com'),
  title: {
    default: 'The Atlanta List: vetted home service pros',
    template: '%s | The Atlanta List',
  },
  description:
    'A curated directory of Atlanta\'s top-rated plumbers, electricians, HVAC techs, roofers, and cleaners. Real businesses, verified ratings. Ranked by rating, never by who paid, and paid featured spots are always labeled.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="font-sans bg-background text-foreground antialiased">
        <SiteHeader />
        <main className="min-h-screen">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
