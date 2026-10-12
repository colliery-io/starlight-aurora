// An Astro integration for a book that moved from mdBook. mdBook served each
// page at <path>.html; Starlight serves it at <path>/. After the build, this
// writes a small page at each old address that sends the reader to the new one
// (see redirects.js). A file of the site is never written over.
//
// First written for the Kairos book (KAIROS-T-0389).
import { fileURLToPath } from 'node:url';
import { redirectPage, writeRedirects } from './redirects.js';

export { redirectPage };

/** mdBook addresses with no page of the same path, by default. */
export const MDBOOK_EXTRA = {
	'introduction.html': './',
	'print.html': './',
};

/**
 * The old address → relative target for each built page, plus `extra`.
 * `extra` adds to the defaults (`MDBOOK_EXTRA`); a value of `null` removes one.
 */
export function redirectFiles(pathnames, extra = {}) {
	const files = { ...MDBOOK_EXTRA, ...extra };
	for (const pathname of pathnames) {
		// "how-to/install-with-helm/" -> "how-to/install-with-helm.html"
		if (!pathname || !pathname.endsWith('/') || pathname === '404/') continue;
		const path = pathname.slice(0, -1);
		files[`${path}.html`] ??= `${path.split('/').pop()}/`;
	}
	for (const [file, target] of Object.entries(files)) if (target == null) delete files[file];
	return files;
}

/**
 * @param {{ extra?: Record<string, string | null> }} [options] old addresses
 *   with no page of the same path, and their relative targets. They are added
 *   to `MDBOOK_EXTRA` (`introduction.html` and `print.html` → the home page);
 *   `null` removes one. For a book whose home was `intro.html`:
 *   `mdbookRedirects({ extra: { 'intro.html': './' } })`.
 * @returns {import('astro').AstroIntegration}
 */
export default function mdbookRedirects(options = {}) {
	return {
		name: 'starlight-aurora-mdbook-redirects',
		hooks: {
			'astro:build:done': async ({ dir, pages, logger }) => {
				const files = redirectFiles(
					pages.map((p) => p.pathname),
					options.extra ?? {},
				);
				const written = await writeRedirects(fileURLToPath(dir), Object.entries(files));
				logger.info(`${written} redirects from the old mdBook addresses`);
			},
		},
	};
}
