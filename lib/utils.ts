import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns the URL only when it is a plain http(s) link, otherwise null.
 * Blocks javascript:, data: and other executable schemes from reaching an href.
 */
export function safeExternalUrl(raw?: string | null): string | null {
  if (!raw) return null;
  const value = raw.trim();
  try {
    const parsed = new URL(value.includes('://') ? value : `https://${value}`);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.toString();
  } catch {
    return null;
  }
}
