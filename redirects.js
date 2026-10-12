// Redirect pages for a static site. GitHub Pages cannot send a server
// redirect, so an old address gets a small HTML page that sends the reader to
// the new one. Each target is relative, so the pages work under any base path
// (`/`, `/repo/`). A script keeps the #anchor of the old link; the meta refresh
// is for a browser with no JavaScript. A file of the site is never written over.
//
// `pageRedirects` is for any old address: a folder address such as MkDocs and
// Hugo use (`guides/install/`), or a file (`old/page.html`). Astro's own
// `redirects` option does not add the base path to the target, so a site under
// `/repo/` cannot use it for this.
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** The HTML of a page that sends the reader to `target` (relative). */
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

const clean = (path) => path.replace(/^\/+/, '');

/**
 * The relative link from the page at `from` to the page at `to`. Both are
 * paths in the site without the base: a folder address ends with `/`
 * (`guides/install/`), a file does not (`old/page.html`); `''` is the home.
 */
export function relativeTarget(from, to) {
	const f = clean(from);
	const fromDir = f.endsWith('/') || f === '' ? f : f.slice(0, f.lastIndexOf('/') + 1);
	const depth = fromDir.split('/').filter(Boolean).length;
	const target = '../'.repeat(depth) + clean(to);
	return target === '' ? './' : target;
}

/** The file that serves an old address: `a/b/` → `a/b/index.html`. */
export function redirectFile(from) {
	const f = clean(from);
	return f === '' || f.endsWith('/') ? `${f}index.html` : f;
}

/**
 * Write a redirect page for each `[from, relativeTarget]`, never over a file
 * of the site. Returns the number written.
 */
export async function writeRedirects(outDir, entries) {
	let written = 0;
	for (const [from, target] of entries) {
		const path = join(outDir, redirectFile(from));
		if (existsSync(path)) continue;
		await mkdir(dirname(path), { recursive: true });
		await writeFile(path, redirectPage(target));
		written++;
	}
	return written;
}

/**
 * An Astro integration that writes a redirect page at each old address.
 *
 *   pageRedirects({ 'guides/install/': 'how-to/install/', 'api/': 'reference/' })
 *
 * Keys and values are paths in the site without the base. A value of `''` is
 * the home page.
 *
 * @param {Record<string, string>} map old address → new address
 * @returns {import('astro').AstroIntegration}
 */
export default function pageRedirects(map = {}) {
	return {
		name: 'starlight-aurora-page-redirects',
		hooks: {
			'astro:build:done': async ({ dir, logger }) => {
				const entries = Object.entries(map).map(([from, to]) => [from, relativeTarget(from, to)]);
				const written = await writeRedirects(fileURLToPath(dir), entries);
				logger.info(`${written} redirects from the old addresses`);
			},
		},
	};
}
