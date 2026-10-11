// Opens each page of a built site in Chrome, in each theme, and checks:
//  - axe's colour-contrast rule (WCAG AA) finds no violation;
//  - Starlight's background and body font are Aurora's.
// It writes a screenshot of each page in each theme to screenshots/.
//
//   node scripts/check-site.mjs docs/dist [--hyper] [--versions] [--base /project/]
import { createServer } from 'node:http';
import { mkdir, readdir, readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { createRequire } from 'node:module';
import { chromium } from 'playwright-core';
import { parseArgs } from './cli.mjs';

const require = createRequire(import.meta.url);
const AXE = await readFile(require.resolve('axe-core/axe.min.js'), 'utf8');

const { dist, base: BASE, flags } = parseArgs(process.argv.slice(2));
const args = [...flags].map((f) => `--${f}`);
// Each case: the stored choice, the OS setting, and the theme that must show.
const themes = [
	{ name: 'light', stored: 'light', os: 'dark', shows: 'light' },
	{ name: 'dark', stored: 'dark', os: 'light', shows: 'dark' },
	{ name: 'auto-light', stored: 'auto', os: 'light', shows: 'light' },
	{ name: 'auto-dark', stored: 'auto', os: 'dark', shows: 'dark' },
	...(args.includes('--hyper') ? [{ name: 'hyper', stored: 'hyper', os: 'light', shows: 'hyper' }] : []),
];
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json', '.wasm': 'application/wasm' };

async function resolveFile(urlPath) {
	let rel = decodeURIComponent(urlPath.split('?')[0]);
	if (rel.startsWith(BASE)) rel = '/' + rel.slice(BASE.length);
	let path = join(dist, normalize(rel));
	if ((await stat(path).catch(() => null))?.isDirectory()) path = join(path, 'index.html');
	return path;
}

const server = createServer(async (req, res) => {
	try {
		const path = await resolveFile(req.url);
		const body = await readFile(path);
		res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' });
		res.end(body);
	} catch {
		res.writeHead(404).end();
	}
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

// Each page: each index.html under dist, but not the 404 page.
async function pages() {
	const out = [];
	for (const entry of await readdir(dist, { recursive: true })) {
		if (entry === 'index.html') out.push(BASE);
		else if (entry.endsWith('/index.html')) out.push(`${BASE}${entry.slice(0, -'index.html'.length)}`);
	}
	return out.sort();
}

const browser = await chromium.launch({ channel: 'chrome' });
let failures = 0;
await mkdir('screenshots', { recursive: true });
try {
	for (const theme of themes) {
		const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: theme.os });
		await context.addInitScript((t) => localStorage.setItem('starlight-theme', t), theme.stored);
		const page = await context.newPage();
		for (const path of await pages()) {
			await page.goto(base + path, { waitUntil: 'networkidle' });
			const shown = await page.evaluate(() => document.documentElement.dataset.theme);
			const found = await page.evaluate(() => {
				const root = getComputedStyle(document.documentElement);
				const probe = document.createElement('div');
				probe.style.background = 'var(--bg)';
				document.body.append(probe);
				const auroraBg = getComputedStyle(probe).backgroundColor;
				probe.remove();
				return {
					bodyBg: getComputedStyle(document.body).backgroundColor,
					auroraBg,
					font: getComputedStyle(document.body).fontFamily,
					slFont: root.getPropertyValue('--sl-font').trim(),
				};
			});
			// Diagrams: wait for Mermaid to draw them, then check that a node and
			// a line have Aurora's colours in this theme.
			const diagrams = await page.locator('pre.mermaid').count();
			if (diagrams) {
				await page
					.waitForFunction((n) => document.querySelectorAll('pre.mermaid svg').length >= n, diagrams, { timeout: 20000 })
					.catch(() => {});
				found.mermaid = await page.evaluate(() => {
					const probe = (value) => {
						const el = document.createElement('div');
						el.style.color = value;
						document.body.append(el);
						const c = getComputedStyle(el).color;
						el.remove();
						return c;
					};
					const svg = document.querySelector('pre.mermaid svg');
					if (!svg) return { drawn: false };
					const node = svg.querySelector('.node rect, .node polygon, rect.actor');
					const line = svg.querySelector('.edgePaths path, .messageLine0, .relation, .transition');
					return {
						drawn: true,
						node: node && getComputedStyle(node).fill,
						panel: probe('var(--panel)'),
						line: line && getComputedStyle(line).stroke,
						edge: probe('var(--edge)'),
					};
				});
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
			if (found.mermaid) {
				const m = found.mermaid;
				if (!m.drawn) problems.push('mermaid: no diagram was drawn');
				else {
					if (m.node !== m.panel) problems.push(`mermaid: node fill ${m.node} is not Aurora --panel ${m.panel}`);
					if (m.line !== m.edge) problems.push(`mermaid: line ${m.line} is not Aurora --edge ${m.edge}`);
				}
			}
			for (const v of axe.violations) for (const n of v.nodes) problems.push(`contrast: ${n.target.join(' ')}: ${n.any[0]?.message ?? v.help}`);
			failures += problems.length;
			console.log(`${problems.length ? 'FAIL' : 'ok  '} ${theme.name.padEnd(10)} ${path}`);
			for (const p of problems) console.log(`       ${p}`);
		}
		await context.close();
	}
} finally {
	await browser.close();
	server.close();
}
// The hyper toggle: the order of the choices, a choice made in the page, a
// reload, and dark code blocks.
if (args.includes('--hyper')) {
	const browser2 = await chromium.launch({ channel: 'chrome' });
	const server2 = createServer(server.listeners('request')[0]);
	await new Promise((r) => server2.listen(0, '127.0.0.1', r));
	const base2 = `http://127.0.0.1:${server2.address().port}`;
	const problems = [];
	try {
		// A page with a code block, to check the code theme under hyper.
		let codePage;
		for (const path of await pages()) {
			const html = await readFile(join(await resolveFile(path)), 'utf8');
			if (html.includes('class="expressive-code')) {
				codePage = path;
				break;
			}
		}
		if (!codePage) throw new Error(`${dist}: no page has a code block`);
		const context = await browser2.newContext({ colorScheme: 'light' });
		const page = await context.newPage();
		await page.goto(base2 + codePage, { waitUntil: 'networkidle' });
		const select = page.locator('starlight-theme-select select').first();
		const values = await select.locator('option').evaluateAll((os) => os.map((o) => o.value));
		if (values.join() !== 'light,dark,hyper,auto') problems.push(`toggle choices are ${values}`);
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
	} finally {
		await browser2.close();
		server2.close();
	}
	console.log(`${problems.length ? 'FAIL' : 'ok  '} hyper toggle: choices, choice, reload, dark code, back to light`);
	for (const p of problems) console.log(`       ${p}`);
	failures += problems.length;
}

// The version select of starlight-versions: it is there with the theme
// select, it lists the versions, and choosing one goes to its pages.
if (args.includes('--versions')) {
	const browser3 = await chromium.launch({ channel: 'chrome' });
	const server3 = createServer(server.listeners('request')[0]);
	await new Promise((r) => server3.listen(0, '127.0.0.1', r));
	const base3 = `http://127.0.0.1:${server3.address().port}`;
	const problems = [];
	try {
		const page = await browser3.newPage();
		for (const theme of ['light', 'dark', ...(args.includes('--hyper') ? ['hyper'] : [])]) {
			await page.addInitScript((t) => localStorage.setItem('starlight-theme', t), theme);
			await page.goto(base3 + BASE, { waitUntil: 'networkidle' });
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
	} finally {
		await browser3.close();
		server3.close();
	}
	console.log(`${problems.length ? 'FAIL' : 'ok  '} version select: options, next to the theme select, goes to the version`);
	for (const p of problems) console.log(`       ${p}`);
	failures += problems.length;
}

if (failures) {
	console.error(`${failures} problem(s)`);
	process.exit(1);
}
