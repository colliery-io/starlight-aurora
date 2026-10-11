// An Astro integration for a book that moved from mdBook. mdBook served each
// page at <path>.html; Starlight serves it at <path>/. After the build, this
// writes a small HTML page at each old address that sends the reader to the
// new one. GitHub Pages is static, so a server redirect is not possible.
//
// Each target is relative ("install-with-helm/"), so the pages work under any
// base path. A script keeps the #anchor of the old link; the meta refresh is
// for a browser with no JavaScript. A file of the site is never written over.
//
// First written for the Kairos book (KAIROS-T-0389).
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** mdBook addresses with no page of the same path, by default. */
export const MDBOOK_EXTRA = {
	'introduction.html': './',
	'print.html': './',
};

/** The old address → relative target for each built page, plus `extra`. */
export function redirectFiles(pathnames, extra = MDBOOK_EXTRA) {
	const files = { ...extra };
	for (const pathname of pathnames) {
		// "how-to/install-with-helm/" -> "how-to/install-with-helm.html"
		if (!pathname || !pathname.endsWith('/') || pathname === '404/') continue;
		const path = pathname.slice(0, -1);
		files[`${path}.html`] = `${path.split('/').pop()}/`;
	}
	return files;
}

export function redirectPage(target) {
	const t = JSON.stringify(target);
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>This page moved</title>
<meta name="robots" content="noindex">
<script>location.replace(${t} + location.hash);</script>
<meta http-equiv="refresh" content="0; url=${target}">
<link rel="canonical" href="${target}">
</head>
<body>
<p>This page moved to <a href="${target}">${target}</a>.</p>
</body>
</html>
`;
}

/**
 * @param {{ extra?: Record<string, string> }} [options] old addresses with no
 *   page of the same path, and their relative targets. The default is
 *   `introduction.html` and `print.html` → the home page.
 * @returns {import('astro').AstroIntegration}
 */
export default function mdbookRedirects(options = {}) {
	const extra = options.extra ?? MDBOOK_EXTRA;
	return {
		name: 'starlight-aurora-mdbook-redirects',
		hooks: {
			'astro:build:done': async ({ dir, pages, logger }) => {
				const out = fileURLToPath(dir);
				const files = redirectFiles(
					pages.map((p) => p.pathname),
					extra,
				);
				let written = 0;
				for (const [file, target] of Object.entries(files)) {
					const path = join(out, file);
					if (existsSync(path)) continue;
					await mkdir(dirname(path), { recursive: true });
					await writeFile(path, redirectPage(target));
					written++;
				}
				logger.info(`${written} redirects from the old mdBook addresses`);
			},
		},
	};
}
