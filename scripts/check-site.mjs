#!/usr/bin/env node
// Opens each page of a built site in Chrome, in each theme, and checks:
//  - axe's colour-contrast rule (WCAG AA) finds no violation;
//  - Starlight's background and body font are Aurora's;
//  - each Mermaid diagram is drawn, and where the diagram type has nodes and
//    lines that the theme colours, they have Aurora's colours.
// Redirect pages (old addresses) are not checked: they only send the reader on.
// It writes a screenshot of each page in each theme to screenshots/.
//
//   starlight-aurora-check-site docs/dist [--hyper] [--versions] [--base /project/]
//                               [--jobs=4] [--shard=1/2]
//
// It needs playwright-core and axe-core (devDependencies of the site) and an
// installed Chrome.
import { createServer } from 'node:http';
import { mkdir, readdir, readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { createRequire } from 'node:module';
import { isRedirectPage, parseArgs, shard } from './cli.mjs';

const require = createRequire(import.meta.url);
let chromium;
let AXE;
try {
	({ chromium } = await import('playwright-core'));
	AXE = await readFile(require.resolve('axe-core/axe.min.js'), 'utf8');
} catch {
	console.error('check-site needs playwright-core and axe-core: npm install --save-dev playwright-core axe-core');
	process.exit(2);
}

const { dist, base: BASE, flags, values } = parseArgs(process.argv.slice(2));
const JOBS = Math.max(1, Number(values.jobs ?? 4));
// Each case: the stored choice, the OS setting, and the theme that must show.
const themes = [
	{ name: 'light', stored: 'light', os: 'dark', shows: 'light' },
	{ name: 'dark', stored: 'dark', os: 'light', shows: 'dark' },
	{ name: 'auto-light', stored: 'auto', os: 'light', shows: 'light' },
	{ name: 'auto-dark', stored: 'auto', os: 'dark', shows: 'dark' },
	...(flags.has('hyper') ? [{ name: 'hyper', stored: 'hyper', os: 'light', shows: 'hyper' }] : []),
];
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json', '.wasm': 'application/wasm' };

async function resolveFile(urlPath) {
	let rel = decodeURIComponent(urlPath.split('?')[0]);
	if (rel.startsWith(BASE)) rel = '/' + rel.slice(BASE.length);
	let path = join(dist, normalize(rel));
	if ((await stat(path).catch(() => null))?.isDirectory()) path = join(path, 'index.html');
	return path;
}

async function serve(req, res) {
	try {
		const path = await resolveFile(req.url);
		const body = await readFile(path);
		res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' });
		res.end(body);
	} catch {
		res.writeHead(404).end();
	}
}

async function listen() {
	const server = createServer(serve);
	await new Promise((r) => server.listen(0, '127.0.0.1', r));
	return { server, origin: `http://127.0.0.1:${server.address().port}` };
}

// Each page: each index.html under dist that is not a redirect page.
async function pages() {
	const out = [];
	for (const entry of await readdir(dist, { recursive: true })) {
		if (entry !== 'index.html' && !entry.endsWith('/index.html')) continue;
		if (isRedirectPage(await readFile(join(dist, entry), 'utf8'))) continue;
		out.push(entry === 'index.html' ? BASE : `${BASE}${entry.slice(0, -'index.html'.length)}`);
	}
	return out.sort();
}

// In the page: the result of each Mermaid diagram.
function mermaidInPage() {
	const colour = (value) => {
		const el = document.createElement('div');
		el.style.color = value;
		document.body.append(el);
		const c = getComputedStyle(el).color;
		el.remove();
		return c;
	};
	const panel = colour('var(--panel)');
	const edge = colour('var(--edge)');
	// The diagram types whose nodes and lines styles/mermaid.css colours.
	const COLOURED = new Set(['flowchart-v2', 'flowchart', 'sequence', 'stateDiagram', 'classDiagram']);
	return [...document.querySelectorAll('pre.mermaid')].map((pre, i) => {
		const svg = pre.querySelector('svg');
		const type = svg?.getAttribute('aria-roledescription') ?? '';
		if (!svg) return { i, type, drawn: false };
		if (type === 'error' || svg.querySelector('.error-icon')) return { i, type, drawn: false, error: true };
		if (!COLOURED.has(type)) return { i, type, drawn: true };
		const node = svg.querySelector('.node rect, .node polygon, rect.actor, .node g.label-container > path:first-child');
		const line = svg.querySelector('.edgePaths path, .messageLine0, .relation, .transition');
		return {
			i,
			type,
			drawn: true,
			node: node ? getComputedStyle(node).fill : null,
			line: line ? getComputedStyle(line).stroke : null,
			panel,
			edge,
		};
	});
}

async function checkPage(page, origin, theme, path) {
	await page.goto(origin + path, { waitUntil: 'networkidle' });
	const shown = await page.evaluate(() => document.documentElement.dataset.theme);
	const found = await page.evaluate(() => {
		const probe = document.createElement('div');
		probe.style.background = 'var(--bg)';
		document.body.append(probe);
		const auroraBg = getComputedStyle(probe).backgroundColor;
		probe.remove();
		return {
			bodyBg: getComputedStyle(document.body).backgroundColor,
			auroraBg,
			font: getComputedStyle(document.body).fontFamily,
		};
	});
	const diagrams = await page.locator('pre.mermaid').count();
	let mermaid = [];
	if (diagrams) {
		// Wait until each diagram is drawn (or shows Mermaid's error).
		await page
			.waitForFunction((n) => document.querySelectorAll('pre.mermaid svg').length >= n, diagrams, { timeout: 20000 })
			.catch(() => {});
		mermaid = await page.evaluate(mermaidInPage);
	}
	await page.addScriptTag({ content: AXE });
	const axe = await page.evaluate(() => axe.run(document, { runOnly: ['color-contrast'] }));
	const name = `${theme.name}${path.slice(BASE.length - 1).replace(/\/$/, '').replace(/\//g, '_') || '_index'}.png`;
	// The top of the page, up to 4000 px: a whole long page is a very large file.
	const height = Math.min(await page.evaluate(() => document.documentElement.scrollHeight), 4000);
	await page.screenshot({ path: join('screenshots', name), fullPage: true, clip: { x: 0, y: 0, width: 1280, height } });

	const problems = [];
	if (shown !== theme.shows) problems.push(`data-theme is ${shown}, not ${theme.shows}`);
	if (found.bodyBg !== found.auroraBg) problems.push(`body background ${found.bodyBg} is not Aurora --bg ${found.auroraBg}`);
	if (!found.font.includes('IBM Plex Sans')) problems.push(`body font is ${found.font}`);
	for (let k = mermaid.length; k < diagrams; k++) problems.push(`mermaid: diagram ${k + 1} was not checked`);
	for (const m of mermaid) {
		const which = `mermaid diagram ${m.i + 1}${m.type ? ` (${m.type})` : ''}`;
		if (!m.drawn) problems.push(`${which}: ${m.error ? 'Mermaid could not draw it' : 'not drawn'}`);
		if (m.node !== undefined && m.node !== null && m.node !== m.panel) problems.push(`${which}: node fill ${m.node} is not Aurora --panel ${m.panel}`);
		if (m.line !== undefined && m.line !== null && m.line !== m.edge) problems.push(`${which}: line ${m.line} is not Aurora --edge ${m.edge}`);
	}
	for (const v of axe.violations) for (const n of v.nodes) problems.push(`contrast: ${n.target.join(' ')}: ${n.any[0]?.message ?? v.help}`);
	return problems;
}

const { server, origin } = await listen();
const browser = await chromium.launch({ channel: 'chrome' });
const list = shard(await pages(), values.shard);
let failures = 0;
await mkdir('screenshots', { recursive: true });
try {
	for (const theme of themes) {
		const results = new Map();
		const queue = [...list];
		// JOBS pages at a time, each in its own browser context; the results
		// print in page order.
		await Promise.all(
			Array.from({ length: Math.min(JOBS, queue.length) }, async () => {
				const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: theme.os });
				await context.addInitScript((t) => localStorage.setItem('starlight-theme', t), theme.stored);
				const page = await context.newPage();
				for (let path = queue.shift(); path !== undefined; path = queue.shift()) {
					results.set(path, await checkPage(page, origin, theme, path).catch((e) => [`could not check: ${e.message}`]));
				}
				await context.close();
			}),
		);
		for (const path of list) {
			const problems = results.get(path);
			failures += problems.length;
			console.log(`${problems.length ? 'FAIL' : 'ok  '} ${theme.name.padEnd(10)} ${path}`);
			for (const p of problems) console.log(`       ${p}`);
		}
	}

	// The hyper toggle: the order of the choices, a choice made in the page, a
	// reload, and dark code blocks.
	if (flags.has('hyper')) {
		const problems = [];
		let codePage;
		for (const path of await pages()) {
			if ((await readFile(await resolveFile(path), 'utf8')).includes('class="expressive-code')) {
				codePage = path;
				break;
			}
		}
		if (!codePage) problems.push(`${dist}: no page has a code block`);
		else {
			const context = await browser.newContext({ colorScheme: 'light' });
			const page = await context.newPage();
			await page.goto(origin + codePage, { waitUntil: 'networkidle' });
			const select = page.locator('starlight-theme-select select').first();
			const choices = await select.locator('option').evaluateAll((os) => os.map((o) => o.value));
			if (choices.join() !== 'light,dark,hyper,auto') problems.push(`toggle choices are ${choices}`);
			await select.selectOption('hyper');
			if ((await page.evaluate(() => document.documentElement.dataset.theme)) !== 'hyper') problems.push('choosing Hyper did not show hyper');
			await page.reload({ waitUntil: 'networkidle' });
			const after = await page.evaluate(() => ({
				theme: document.documentElement.dataset.theme,
				picked: document.querySelector('starlight-theme-select select')?.value,
				code: getComputedStyle(document.querySelector('.expressive-code pre')).backgroundColor,
				codeTheme: document.querySelector('.expressive-code')?.dataset.theme,
			}));
			if (after.theme !== 'hyper' || after.picked !== 'hyper') problems.push(`after a reload: theme ${after.theme}, picker ${after.picked}`);
			const [r, g, b] = after.code.match(/\d+/g).map(Number);
			if (r + g + b > 3 * 64) problems.push(`code block background ${after.code} is not dark`);
			if (after.codeTheme !== 'dark') problems.push(`code block data-theme is ${after.codeTheme}`);
			await select.selectOption('light');
			const back = await page.evaluate(() => document.querySelector('.expressive-code')?.dataset.theme);
			if (back !== undefined) problems.push(`after Light, the code block keeps data-theme ${back}`);
			await context.close();
		}
		console.log(`${problems.length ? 'FAIL' : 'ok  '} hyper toggle: choices, choice, reload, dark code, back to light`);
		for (const p of problems) console.log(`       ${p}`);
		failures += problems.length;
	}

	// The version select of starlight-versions: it is there with the theme
	// select, it lists the versions, and choosing one goes to its pages.
	if (flags.has('versions')) {
		const problems = [];
		const page = await browser.newPage();
		for (const theme of ['light', 'dark', ...(flags.has('hyper') ? ['hyper'] : [])]) {
			await page.addInitScript((t) => localStorage.setItem('starlight-theme', t), theme);
			await page.goto(origin + BASE, { waitUntil: 'networkidle' });
			const found = await page.evaluate(() => ({
				versions: [...document.querySelectorAll('starlight-version-select option')].map((o) => o.textContent.trim()),
				themes: document.querySelectorAll('starlight-theme-select select').length,
			}));
			if (found.versions.length < 2) problems.push(`${theme}: version select options are ${found.versions}`);
			if (!found.themes) problems.push(`${theme}: no theme select next to the version select`);
		}
		const select = page.locator('starlight-version-select select').first();
		if ((await select.locator('option').count()) >= 2) {
			const target = await select.locator('option').nth(1).getAttribute('value');
			await Promise.all([page.waitForURL(`**${target}`), select.selectOption({ index: 1 })]);
			const notice = await page.locator('.sl-banner, [class*=version]').count();
			if (!new URL(page.url()).pathname.startsWith(target)) problems.push(`choosing a version went to ${page.url()}`);
			if (!notice) problems.push('the page of an earlier version has no version notice');
		}
		await page.close();
		console.log(`${problems.length ? 'FAIL' : 'ok  '} version select: options, next to the theme select, goes to the version`);
		for (const p of problems) console.log(`       ${p}`);
		failures += problems.length;
	}
} finally {
	await browser.close();
	server.close();
}

if (failures) {
	console.error(`${failures} problem(s)`);
	process.exit(1);
}
