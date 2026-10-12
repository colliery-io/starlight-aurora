#!/usr/bin/env node
// Checks the internal links of a built site: each href, src and refresh
// target of each page must reach a file of the site, and each #anchor an id
// on the target page. The site is read as it would be served under `base`.
//
//   node scripts/check-links.mjs docs/dist [--base /project/]
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { isMain, parseArgs } from './cli.mjs';

const ATTR = /\s(?:href|src)\s*=\s*"([^"]*)"/g;
const REFRESH = /http-equiv="refresh"\s+content="[^"]*url=([^"]+)"/gi;
const ID = /\s(?:id|name)\s*=\s*"([^"]*)"/g;

/** The URL path that serves an HTML file of the site. */
export function pageUrl(file, base) {
	const rel = file.replace(/\\/g, '/');
	const path = rel.endsWith('index.html') ? rel.slice(0, -'index.html'.length) : rel;
	return base + path;
}

/** The internal references of a page: href, src and refresh targets. */
export function references(html) {
	const out = [];
	for (const re of [ATTR, REFRESH]) for (const m of html.matchAll(re)) out.push(m[1].replace(/&amp;/g, '&'));
	return out.filter((r) => r && !/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(r));
}

export function ids(html) {
	return new Set([...html.matchAll(ID)].map((m) => m[1]));
}

/** The file of the site for a URL path, or undefined. */
export function fileFor(dist, base, pathname) {
	if (!pathname.startsWith(base)) return undefined;
	let rel = decodeURIComponent(pathname.slice(base.length));
	let path = join(dist, rel);
	if (rel === '' || rel.endsWith('/')) path = join(path, 'index.html');
	else if (existsSync(path) && statSync(path).isDirectory()) path = join(path, 'index.html');
	return existsSync(path) ? path : undefined;
}

export function checkSite(dist, base = '/') {
	const files = readdirSync(dist, { recursive: true }).filter((f) => f.endsWith('.html'));
	const idCache = new Map();
	const idsOf = (path) => {
		if (!idCache.has(path)) idCache.set(path, ids(readFileSync(path, 'utf8')));
		return idCache.get(path);
	};
	const errors = [];
	let checked = 0;
	for (const file of files) {
		const from = pageUrl(file, base);
		const html = readFileSync(join(dist, file), 'utf8');
		for (const ref of references(html)) {
			checked++;
			const url = new URL(ref, `http://site${from}`);
			const target = fileFor(dist, base, url.pathname);
			if (!target) {
				errors.push(`${from}: ${ref} → ${url.pathname} is not in the site`);
				continue;
			}
			const anchor = decodeURIComponent(url.hash.slice(1));
			if (anchor && target.endsWith('.html') && !idsOf(target).has(anchor)) {
				errors.push(`${from}: ${ref} → no #${anchor} on ${url.pathname}`);
			}
		}
	}
	return { pages: files.length, checked, errors };
}

if (isMain(import.meta.url)) {
	const { dist, base } = parseArgs(process.argv.slice(2));
	const { pages, checked, errors } = checkSite(dist, base);
	for (const e of errors.slice(0, 50)) console.log(`  ${e}`);
	if (errors.length > 50) console.log(`  … and ${errors.length - 50} more`);
	console.log(`${dist} at ${base}: ${pages} pages, ${checked} internal links, ${errors.length} broken`);
	if (errors.length) process.exit(1);
}
