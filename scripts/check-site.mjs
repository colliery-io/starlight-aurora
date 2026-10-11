// Opens each page of a built site in Chrome, in each theme, and checks:
//  - axe's colour-contrast rule (WCAG AA) finds no violation;
//  - Starlight's background and body font are Aurora's.
// It writes a screenshot of each page in each theme to screenshots/.
//
//   node scripts/check-site.mjs demo/dist [--hyper]
import { createServer } from 'node:http';
import { mkdir, readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { createRequire } from 'node:module';
import { chromium } from 'playwright-core';

const require = createRequire(import.meta.url);
const AXE = await readFile(require.resolve('axe-core/axe.min.js'), 'utf8');

const args = process.argv.slice(2);
const dist = args.find((a) => !a.startsWith('--')) ?? 'demo/dist';
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
	let path = join(dist, normalize(decodeURIComponent(urlPath.split('?')[0])));
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

async function pages() {
	const sitemap = await readFile(join(dist, 'sitemap-0.xml'), 'utf8').catch(() => null);
	if (sitemap) return [...sitemap.matchAll(/<loc>[^<]*?(\/[^<]*)<\/loc>/g)].map((m) => new URL(m[1], base).pathname);
	return ['/'];
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
			await page.addScriptTag({ content: AXE });
			const axe = await page.evaluate(() => axe.run(document, { runOnly: ['color-contrast'] }));
			const name = `${theme.name}${path.replace(/\/$/, '').replace(/\//g, '_') || '_index'}.png`;
			await page.screenshot({ path: join('screenshots', name), fullPage: true });

			const problems = [];
			if (shown !== theme.shows) problems.push(`data-theme is ${shown}, not ${theme.shows}`);
			if (found.bodyBg !== found.auroraBg) problems.push(`body background ${found.bodyBg} is not Aurora --bg ${found.auroraBg}`);
			if (!found.font.includes('IBM Plex Sans')) problems.push(`body font is ${found.font}`);
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
if (failures) {
	console.error(`${failures} problem(s)`);
	process.exit(1);
}
