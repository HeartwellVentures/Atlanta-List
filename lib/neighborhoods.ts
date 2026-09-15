export interface Neighborhood {
  slug: string;
  name: string;
  intro: string;
}

export const neighborhoods: Neighborhood[] = [
  {
    slug: 'buckhead',
    name: 'Buckhead',
    intro: 'Buckhead\'s tree-canopied streets carry everything from 1920s estates to midcentury ranches needing expert care.',
  },
  {
    slug: 'midtown',
    name: 'Midtown',
    intro: 'Midtown\'s high-rises and historic homes share one need: fast, skilled help close to the buzz.',
  },
  {
    slug: 'decatur',
    name: 'Decatur',
    intro: 'Decatur\'s Craftsman bungalows and tight-knit blocks rely on pros who respect older home details.',
  },
  {
    slug: 'virginia-highland',
    name: 'Virginia-Highland',
    intro: 'Virginia-Highland\'s bungalows and quirky sidewalks call for careful, respectful home pros.',
  },
  {
    slug: 'east-atlanta',
    name: 'East Atlanta',
    intro: 'East Atlanta\'s ranch slabs and post-war homes keep pros busy with honest repair and steady service.',
  },
  {
    slug: 'westside',
    name: 'Westside',
    intro: 'Westside\'s historic West End and redeveloped industrial corridors need pros across trade tiers.',
  },
  {
    slug: 'sandy-springs',
    name: 'Sandy Springs',
    intro: 'Sandy Springs\' ranches and townhomes north of the city rely on dependable pros with solid reviews.',
  },
  {
    slug: 'brookhaven',
    name: 'Brookhaven',
    intro: 'Brookhaven\'s brick ranches and newer infill homes lean on pros who keep older neighborhoods sharp.',
  },
];
