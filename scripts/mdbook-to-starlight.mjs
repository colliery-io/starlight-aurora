#!/usr/bin/env node
// Converts the pages of an mdBook book into Starlight content pages.
//
//   starlight-aurora-from-mdbook <book src folder> <content folder> [--escape-mdx]
//
// For each .md page under the book's src (not SUMMARY.md) it writes a page
// under the content folder (README.md becomes index.md), and:
//  - makes the first `# Heading` the front-matter `title`, and removes it;
//  - removes a `---` (or `***`) rule right after that heading, which would
//    otherwise swallow the first section once the page has front matter;
//  - rewrites links to other pages (`page.md`, `page.md#anchor`, `page.html`)
//    as relative routes (`../page/`), which work under any base path;
//  - with --escape-mdx: escapes `{`, `}` and a `<` that does not start a tag,
//    outside code, for pages that a tool reads as MDX (starlight-versions does).
// Then it prints a Starlight sidebar made from SUMMARY.md, to paste into
// astro.config.mjs. Images and other files are not copied.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { isMain, parseArgs } from './cli.mjs';

/** The route of a page file: `a/b.md` → `a/b/`, `a/README.md` → `a/`. */
export function routeOf(file) {
	const f = file.replace(/\\/g, '/').replace(/\.(md|html)$/, '');
	const base = f.split('/').pop();
	if (base === 'README' || base === 'index') return f.slice(0, -base.length);
	return `${f}/`;
}

/** The output file of a page: README.md → index.md. */
export function outputOf(file) {
	return file.replace(/(^|\/)README\.md$/, '$1index.md');
}

/** The relative link from the page at route `from` to the page at route `to`. */
export function relativeRoute(fromRoute, toRoute) {
	const rel = posix.relative(`/${fromRoute}`, `/${toRoute}`);
	return rel === '' ? './' : `${rel}/`.replace(/\/\/$/, '/');
}

/** Splits text into code (fences, inline code) and prose, to edit prose only. */
function mapProse(text, fn) {
	const out = [];
	const fence = /^(```+|~~~+)[^\n]*\n[\s\S]*?^\1[ \t]*$/gm;
	let last = 0;
	for (const m of text.matchAll(fence)) {
		out.push(mapInline(text.slice(last, m.index), fn), m[0]);
		last = m.index + m[0].length;
	}
	out.push(mapInline(text.slice(last), fn));
	return out.join('');
}

function mapInline(text, fn) {
	return text
		.split(/(`+[^`\n]*`+)/g)
		.map((part, i) => (i % 2 ? part : fn(part)))
		.join('');
}

/** Escapes what MDX reads as syntax in plain text. */
export function escapeMdx(text) {
	return mapProse(text, (s) => s.replace(/[{}]/g, (c) => `\\${c}`).replace(/<(?![a-zA-Z/!])/g, '&lt;'));
}

/** Converts one page. `file` is its path under the book's src. */
export function convertPage(source, file, { mdx = false } = {}) {
	let body = source.replace(/\r\n/g, '\n');
	let front = '';
	const fm = /^---\n([\s\S]*?)\n---\n/.exec(body);
	if (fm) {
		front = fm[1];
		body = body.slice(fm[0].length);
	}
	let title;
	const h1 = /^\s*(?:<!--[\s\S]*?-->\s*)*#[ \t]+(.+?)[ \t#]*\n/.exec(body);
	if (h1) {
		title = h1[1].replace(/`/g, '').trim();
		body = body.slice(h1.index + h1[0].length).replace(/^\s*(?:---|\*\*\*|___)[ \t]*\n/, '\n');
	}
	if (!title) title = file.replace(/\.md$/, '').split('/').pop().replace(/[-_]/g, ' ');
	const from = routeOf(file);
	body = mapProse(body, (s) =>
		s.replace(/\]\(([^)\s#]+?\.(?:md|html))(#[^)\s]*)?\)/g, (all, target, hash = '') => {
			if (/^[a-z]+:/i.test(target)) return all;
			const to = routeOf(posix.join(posix.dirname(file), target));
			return `](${relativeRoute(from, to)}${hash})`;
		}),
	);
	if (mdx) body = escapeMdx(body);
	const fmLines = front ? front.split('\n').filter((l) => !/^title\s*:/.test(l)) : [];
	return `---\ntitle: ${JSON.stringify(title)}\n${fmLines.length ? fmLines.join('\n') + '\n' : ''}---\n\n${body.replace(/^\n+/, '')}`;
}

/**
 * A Starlight sidebar from an mdBook SUMMARY.md. A `# Part` heading becomes a
 * group; a page with nested pages becomes a group that starts with the page
 * (as "Overview"); a draft entry with no link becomes a group of its children.
 */
export function sidebarFromSummary(summary) {
	// Parse the list into a tree: { label, slug, children }.
	const parts = [{ label: null, children: [] }];
	const stack = [{ indent: -1, node: parts[0] }];
	let seenItem = false;
	let seenHeading = false;
	for (const line of summary.split('\n')) {
		const part = /^(#+)\s+(.+)$/.exec(line);
		// The very first heading, before any entry, is the file's title ("# Summary").
		if (part && !seenItem && !seenHeading) {
			seenHeading = true;
			continue;
		}
		if (part) {
			// "# Part" is a top group; "## Sub" is a group inside the last part.
			const node = { label: part[2].trim(), children: [] };
			const top = parts.length > 1 ? parts[parts.length - 1] : null;
			if (part[1].length > 1 && top) top.children.push(node);
			else parts.push(node);
			stack.length = 0;
			stack.push({ indent: -1, node });
			continue;
		}
		// A list entry, or an unbulleted prefix or suffix chapter.
		const m = /^(\s*)(?:[-*]\s+)?\[([^\]]+)\]\(([^)]*)\)\s*$/.exec(line);
		if (!m) continue;
		seenItem = true;
		const indent = m[1].replace(/\t/g, '    ').length;
		while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
		const node = { label: m[2], slug: m[3] ? routeOf(m[3]).replace(/\/$/, '') || 'index' : null, children: [] };
		stack[stack.length - 1].node.children.push(node);
		stack.push({ indent, node });
	}
	const toItem = (n) => {
		if (!n.children.length) return n.slug ? { label: n.label, slug: n.slug } : { label: n.label, items: [] };
		const items = n.children.map(toItem);
		return { label: n.label, items: n.slug ? [{ label: 'Overview', slug: n.slug }, ...items] : items };
	};
	const out = [];
	for (const p of parts) {
		const items = p.children.map(toItem);
		if (p.label === null) out.push(...items);
		else out.push({ label: p.label, items });
	}
	return out;
}

function* walk(dir, rel = '') {
	for (const e of readdirSync(join(dir, rel), { withFileTypes: true })) {
		const r = rel ? `${rel}/${e.name}` : e.name;
		if (e.isDirectory()) yield* walk(dir, r);
		else if (e.name.endsWith('.md') && r !== 'SUMMARY.md') yield r;
	}
}

if (isMain(import.meta.url)) {
	const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
	const { flags } = parseArgs(process.argv.slice(2));
	const [src, out] = args;
	if (!src || !out) {
		console.error('usage: starlight-aurora-from-mdbook <book src folder> <content folder> [--escape-mdx]');
		process.exit(2);
	}
	let n = 0;
	for (const file of walk(src)) {
		const dest = join(out, outputOf(file));
		mkdirSync(dirname(dest), { recursive: true });
		writeFileSync(dest, convertPage(readFileSync(join(src, file), 'utf8'), file, { mdx: flags.has('escape-mdx') }));
		n++;
	}
	console.error(`${n} pages written to ${out}`);
	const summary = join(src, 'SUMMARY.md');
	if (existsSync(summary)) {
		console.error('Sidebar from SUMMARY.md (paste into starlight({ sidebar })):');
		console.log(JSON.stringify(sidebarFromSummary(readFileSync(summary, 'utf8')), null, 2));
	}
}
