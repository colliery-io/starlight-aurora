import type { AstroIntegration } from 'astro';

export function redirectPage(target: string): string;
export function relativeTarget(from: string, to: string): string;
export function redirectFile(from: string): string;
export function writeRedirects(outDir: string, entries: Array<[string, string]>): Promise<number>;
export default function pageRedirects(map?: Record<string, string>): AstroIntegration;
