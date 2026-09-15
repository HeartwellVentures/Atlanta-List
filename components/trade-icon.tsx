import { Wrench, Droplets, Plug, Wind, Home, SprayCan, Hammer, Zap, Snowflake, Sparkles, LucideIcon } from 'lucide-react';

const icons: Record<string, LucideIcon> = {
  plumbers: Droplets,
  electricians: Plug,
  hvac: Wind,
  roofers: Home,
  cleaners: SprayCan,
};

export function TradeIcon({ trade, size = 5 }: { trade: string; size?: number }) {
  const Icon = icons[trade] ?? Wrench;
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
      <Icon className="h-5 w-5" />
    </span>
  );
}
