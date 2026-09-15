# The Atlanta List

A curated directory of Atlanta's top-rated home service pros. Pros pay flat membership,
never per-lead fees. Homeowners browse free.

Built with Next.js 13, Tailwind CSS, Supabase (Postgres), and shadcn/ui.

## Setup

1. Clone this repo and install dependencies.
2. Copy `.env.example` to `.env` and fill in the values shown there.
3. The Supabase project is pre-provisioned by Bolt, including the anon key.
4. Run the initial migration and seed script once.

## Running locally

`npm install`
`npm run dev`
The app runs at http://localhost:3000 .

## Data model

- `pros`: directory listings with tier (`free` | `featured` | `premium`), trade, neighborhoods, aggregated ratings
- `inquiries`: quote requests submitted from a profile page
- `memberships`: paid-tier selections by pros

Seed script: `node scripts/seed.js`.

## Admin

Visit `/admin`. The password is set in the admin page (`atlanta-admin` by default).
To change the password:

1. Open `app/admin/page.tsx`.
2. Edit the constant `ADMIN_PASSWORD` near the top of the file.
3. Redeploy.

Admin can approve or unapprove listings, switch tiers, and toggle featured status. Changes
show on the site within a minute thanks to revalidation.

## Stripe (not required to run the app yet)

Payment tiers are built as pages and flows ready to activate. Once you set up Stripe,
add the following to `.env`:

`STRIPE_SECRET_KEY=`
`NEXT_PUBLIC_STRIPE_PUBLIC_KEY=`

and the existing claim flow can route checkout instead of a simple tier-pick. Hook up your
key through Bolt's Stripe onboarding when you are ready.

## SEO

Each page sets its own title and description; profile pages embed `LocalBusiness` schema,
trade pages embed `FAQPage` schema, and breadcrumbs add `BreadcrumbList` markup. Sitemap
available at `/sitemap.xml` and robots.txt at `/robots.txt`.

## Deploy

Static export is the goal. The deployed site updates listings without rebuilds, because
listing pages use Next.js revalidation.
