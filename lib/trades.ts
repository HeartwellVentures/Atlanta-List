import type { LucideIcon } from 'lucide-react';
import { Plug, Snowflake, Home, Droplets, Sparkles, Wrench, Zap, Wind, Hammer, SprayCan } from 'lucide-react';

export interface Trade {
  slug: string;
  name: string;
  plural: string;
  icon: LucideIcon;
  intro: string;
  faq: { q: string; a: string }[];
  skills: string[];
  /** Atlanta-specific expert guidance, shown as a "good to know" block. */
  expertNote: { title: string; body: string };
  /** Honest cost snapshot, consistent with the trade FAQ answers. */
  costRange: { low: string; typical: string; high: string };
}

export const trades: Trade[] = [
  {
    slug: 'plumbers',
    name: 'Plumbers',
    plural: 'Plumbers',
    icon: Droplets,
    intro:
      'Atlanta\'s older homes, from Craftsman bungalows in Grant Park to brick ranches in Brookhaven, keep plumbers busy with aging supply lines, clogged drains, and water heaters nearing the end of their life. The plumbers on this list understand Atlanta\'s mix of older cast-iron waste lines and newer PEX retrofits.',
    faq: [
      {
        q: 'How much does a plumber cost in Atlanta?',
        a: 'Most routine visits run from $95 to $180 for the first hour, with drain clearing and fixture work priced after diagnosis. Emergency calls and main-line repairs cost more. Ask each pro for a written estimate before work begins.',
      },
      {
        q: 'Do Atlanta plumbers offer emergency service?',
        a: 'Many do. Burst pipe or a major leak? Look for pros who list extended hours and emergency availability in their profiles, and confirm a real technician is on call before you shut off water at the main.',
      },
      {
        q: 'How do I choose between plumbers on The Atlanta List?',
        a: 'Compare their star ratings, how many reviews they have accumulated, which neighborhoods they serve, and their listed specialties. Then call the pros whose service focus matches your job.',
      },
      {
        q: 'Are these plumbers licensed and insured?',
        a: 'Membership on The Atlanta List signals quality, but always confirm a current Georgia license and insurance on the spot before hired work begins. Reputable pros expect the question.',
      },
    ],
    skills: ['Dripping faucet', 'Clogged drain', 'Water heater',
      'Burst pipe', 'Toilet repair', 'Gas line', 'Sewer line'],
    expertNote: {
      title: 'What Atlanta homeowners should know',
      body: "Atlanta's humid summers make pipe sweating and condensation leaks common, and many intown homes still run on aging galvanized supply lines or cast-iron waste lines. If your home predates the 1980s, ask a pro about the condition of your main line before a small clog becomes a dig-up. And find your main water shutoff before you ever need it in a hurry.",
    },
    costRange: {
      low: 'Service calls from $95',
      typical: 'Typical visit $95\u2013$180',
      high: '$500+ for main-line work',
    },
  },
  {
    slug: 'electricians',
    name: 'Electricians',
    plural: 'Electricians',
    icon: Plug,
    intro:
      'Atlanta\'s housing stock spans pre-war knob-and-tube wiring and newer smart panels, and the city\'s renovation surge keeps licensed electricians in constant demand. The electricians here range from panel upgrades and circuit troubleshooting to EV charger installs and whole-home rewires.',
    faq: [
      {
        q: 'How much does an electrician cost in Atlanta?',
        a: 'Simple service calls usually run $80 to $150, panel replacements run into the thousands, and EV charger installs depend on distance and amperage. A written estimate is standard practice.',
      },
      {
        q: 'Is it safe to DIY small electrical fixes?',
        a: 'Swapping a light bulb is fine. Anything inside a panel, any rewiring, and any breaker work belongs to a licensed pro. Electrical mistakes create fire risk.',
      },
      {
        q: 'Do Atlanta electricians install EV chargers?',
        a: 'Many do, and it is one of the most requested jobs in the city right now. Pros here list EV charging explicitly when it is a specialty.',
      },
      {
        q: 'How do I pick an electrician from the list?',
        a: 'Match the scope of your job to their listed specialties, compare ratings and review volume, then call. Rankings on The Atlanta List are based on ratings and review counts. Paid featured spots are always labeled.',
      },
    ],
    skills: ['Panel upgrade', 'Outlet repair', 'Lighting',
      'EV charger', 'Whole-home rewire', 'Generator', 'Smart home'],
    expertNote: {
      title: 'What Atlanta homeowners should know',
      body: "Plenty of Atlanta homes still carry pre-war wiring or panels that predate modern demand, and the city's renovation surge keeps panel upgrades constant. If breakers trip regularly or lights dim when appliances kick on, that is a licensed-pro conversation, not a DIY weekend. Anything inside the panel, and any rewiring, belongs to a pro.",
    },
    costRange: {
      low: 'Service calls from $80',
      typical: 'Typical visit $80\u2013$150',
      high: '$2,000+ for panel replacement',
    },
  },
  {
    slug: 'hvac',
    name: 'HVAC',
    plural: 'HVAC techs',
    icon: Wind,
    intro:
      'Georgia heat and long shoulder seasons mean a working air conditioner is not optional, and a reliable furnace matters from October through March. The HVAC pros on this list handle seasonal tune-ups, emergency failures, and full system replacements across bungalow, ranch, and new-construction homes across the city region.',
    faq: [
      {
        q: 'How much does HVAC service cost in Atlanta?',
        a: 'A tune-up typically runs $85 to $150, repairs vary by part, and full system replacements range from $5,000 up depending on size and efficiency. Written quotes protect you.',
      },
      {
        q: 'When does an AC get the busiest in Atlanta?',
        a: 'Late June through September. A lot of homeowners schedule annual spring tune-ups and fall furnace checks on the same day each year.',
      },
      {
        q: 'Should I repair or replace an aging system?',
        a: 'A common rule: if the repair is more than half the cost of replacement and the unit is over 12 years old, replacement may be smarter. Ask two of these pros for written opinions.',
      },
      {
        q: 'Do HVAC pros offer maintenance plans?',
        a: 'Many do. A plan usually means priority service and preseason visits, which matters when the first heat wave hits Atlanta.',
      },
    ],
    skills: ['AC repair', 'Furnace repair', 'Seasonal tune-up',
      'System replacement', 'Duct work', 'Thermostat', 'Heat pump'],
    expertNote: {
      title: 'What Atlanta homeowners should know',
      body: 'Atlanta heat punishes neglected systems from late June through September, which is exactly why spring tune-ups exist: a visit in April beats a no-AC emergency in August. If your unit is over 12 years old and a repair quote tops half the cost of replacement, ask two pros for written opinions before you decide.',
    },
    costRange: {
      low: 'Tune-ups $85\u2013$150',
      typical: 'Repairs vary by part',
      high: '$5,000+ for full replacement',
    },
  },
  {
    slug: 'roofers',
    name: 'Roofers',
    plural: 'Roofers',
    icon: Home,
    intro:
      'Between summer storms, pine pollen accumulation, and the freeze-thaw swings of North Georgia, Atlanta roofs take a beating. Pros here handle leak repairs, full asphalt shingle replacements, and metal roofing on everything from intown bungalows to suburban two-stories.',
    faq: [
      {
        q: 'How much does a new roof cost in Atlanta?',
        a: 'Asphalt shingle replacements typically run between $8,000 and $16,000 depending on size, pitch, and layers. Metal runs higher. A roof inspection clarifies scope.',
      },
      {
        q: 'Can I repair instead of replacing a roof?',
        a: 'If the roof is young and damage is isolated, repair often makes sense. Pros here will say when repair versus replace is the honest answer rather than upsell.',
      },
      {
        q: 'When is roofing season in Atlanta?',
        a: 'Most work happens April through November. Storm damage should be addressed before the next weather window, not held off.',
      },
      {
        q: 'How do I compare roofing estimates?',
        a: 'Match scope: tear-off versus overlay, materials, warranty terms, and start date. Ratings and review volume here help, and multiple written quotes are normal.',
      },
    ],
    skills: ['Roof repair', 'Full replacement', 'Storm damage',
      'Metal roof', 'Gutters', 'Inspection'],
    expertNote: {
      title: 'What Atlanta homeowners should know',
      body: "Atlanta's storm season and heavy tree cover mean most roof damage here starts with falling limbs and wind-lifted shingles, not age alone. After any major storm, get an inspection before the next weather window, and compare estimates on identical scope: tear-off versus overlay, materials, warranty terms, and start date.",
    },
    costRange: {
      low: 'Inspections often free',
      typical: 'Shingle replacement $8k\u2013$16k',
      high: 'Metal roofs run higher',
    },
  },
  {
    slug: 'cleaners',
    name: 'House Cleaners',
    plural: 'House cleaners',
    icon: SprayCan,
    intro:
      'Between Atlanta\'s busy workweeks and tight move-in turnovers, dependable house cleaning is more valuable than a luxury. The cleaners on this list offer recurring residential service, deep-clean resets, and move-out-ready refreshes across condos, bungalows, and family homes in the city and close-in suburbs.',
    faq: [
      {
        q: 'How much does house cleaning cost in Atlanta?',
        a: 'Recurring visits usually run $110 to $180 per cleaning depending on home size and frequency, and deep cleans cost more. Flat-rate quotes are the norm.',
      },
      {
        q: 'Do these cleaners bring their own supplies?',
        a: 'Most do. Many also offer green or fragrance-free options. Check each profile for supply and eco preferences.',
      },
      {
        q: 'How do I choose a cleaner from the list?',
        a: 'Look at the specialties they list, whether they offer recurring schedules, their ratings and review depth, and the neighborhoods they serve most often.',
      },
      {
        q: 'Should I schedule a recurring clean or a deep clean first?',
        a: 'If your home has not had a professional clean recently, start with a deep clean. Recurring visits then stay fast and predictable.',
      },
    ],
    skills: ['Recurring cleaning', 'Deep clean', 'Move-out clean',
      'Green products', 'Kitchen detail', 'Bathroom detail'],
    expertNote: {
      title: 'What Atlanta homeowners should know',
      body: "If your home has not had a professional clean in a while, start with a deep clean and then move to recurring visits. That is the sequence that keeps pricing predictable. Most Atlanta cleaners bring their own supplies, and many offer green or fragrance-free options if you ask.",
    },
    costRange: {
      low: 'Recurring visits $110\u2013$180',
      typical: 'Flat-rate quotes are the norm',
      high: 'Deep cleans cost more',
    },
  },
];

export function getTrade(slug: string) {
  return trades.find((t) => t.slug === slug);
}

// Licensed fallback imagery shown when a pro has no photo (Pexels license,
// except roofers-2 which is U.S. federal public domain). Multiple images per
// trade; the pro's slug picks one deterministically so cards in the same
// trade don't all show the identical photo.
const TRADE_IMAGES: Record<string, string[]> = {
  plumbers: ['/images/trades/plumbers.jpg', '/images/trades/plumbers-2.webp'],
  electricians: ['/images/trades/electricians.jpg', '/images/trades/electricians-2.jpg'],
  hvac: ['/images/trades/hvac.jpg', '/images/trades/hvac-2.jpg'],
  roofers: ['/images/trades/roofers.jpg', '/images/trades/roofers-2.jpg'],
  cleaners: ['/images/trades/cleaners.jpg', '/images/trades/cleaners-2.jpg'],
};

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

export function tradeImage(tradeSlug: string, seed = ''): string {
  const images = TRADE_IMAGES[tradeSlug] ?? TRADE_IMAGES.plumbers;
  return images[hashSeed(seed || tradeSlug) % images.length];
}
