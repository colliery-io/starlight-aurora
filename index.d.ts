import type { StarlightPlugin } from '@astrojs/starlight/types';

export interface AuroraOptions {
	/** Load Aurora's hyper theme and offer it in the theme toggle. Default false. */
	hyper?: boolean;
}

export function auroraCss(options?: AuroraOptions): string[];

export function auroraComponents(options?: AuroraOptions): Record<string, string>;

export const codeStyleOverrides: Record<string, string>;

export function auroraExpressiveCode(userConfig: unknown): unknown;

export default function starlightAurora(options?: AuroraOptions): StarlightPlugin;
