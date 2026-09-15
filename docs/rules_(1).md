# Build rules (every Bolt project)

## Stack
- Default: TypeScript, React functional components, Vite, Tailwind CSS.
- Use Next.js with static generation ONLY when search discovery is central
  (directories, content sites, SEO-dependent landing pages).

## Engineering
- Boring, well-known libraries. No exotic dependencies.
- Portable backends only. No proprietary lock-in.
- Persistence: prefer SQLite or Postgres. If the project needs a hosted DB,
  use Supabase.
- Every project ships with: working features (no dead buttons, no lorem ipsum,
  no visible TODOs), a README a stranger can follow, and `.env.example`
  (never real secrets).
- Mobile-responsive. Must look intentional at 390px width.
- Leave clean seams for payments (Stripe), auth, and an admin view, even if
  they are not built now.
- Push to GitHub at every working milestone with clear commit messages.

## Copy
- No em dashes anywhere in user-facing copy. Use commas, colons, or separate
  sentences.

## Corrections
- Change only what the prompt asks for. Do not restyle, restructure, or
  "improve" anything else on the page.
- Verify each fix actually works (image loads, text is readable, link goes
  somewhere). No fix that trades one visible bug for another.
