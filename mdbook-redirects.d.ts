import type { AstroIntegration } from 'astro';

export const MDBOOK_EXTRA: Record<string, string>;
export function redirectFiles(pathnames: string[], extra?: Record<string, string | null>): Record<string, string>;
export function redirectPage(target: string): string;
export default function mdbookRedirects(options?: { extra?: Record<string, string | null> }): AstroIntegration;
