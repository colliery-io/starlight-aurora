import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isMain, parseArgs } from '../scripts/cli.mjs';

test('the site folder is read in each order, with and without --base', () => {
	for (const [args, dist, base] of [
		[['site'], 'site', '/'],
		[['site', '--hyper'], 'site', '/'],
		[['--hyper', 'site'], 'site', '/'],
		[['site', '--base', '/x/'], 'site', '/x/'],
		[['--base', '/x', 'site', '--hyper'], 'site', '/x/'],
		[['--base', 'x', '--versions'], 'docs/dist', '/x/'],
		[[], 'docs/dist', '/'],
	]) {
		const got = parseArgs(args);
		assert.equal(got.dist, dist, args.join(' '));
		assert.equal(got.base, base, args.join(' '));
	}
	assert.deepEqual([...parseArgs(['site', '--hyper', '--versions']).flags].sort(), ['hyper', 'versions']);
});

test('isMain compares real paths', () => {
	const self = fileURLToPath(import.meta.url);
	assert.equal(isMain(import.meta.url, self), true);
	assert.equal(isMain(import.meta.url, '/no/such/file.mjs'), false);
	assert.equal(isMain(import.meta.url, ''), false);
});

test('a check run through a symlinked path still checks, and fails on a broken site', () => {
	const dir = mkdtempSync(join(tmpdir(), 'sa-cli-'));
	try {
		const scripts = fileURLToPath(new URL('../scripts/', import.meta.url));
		symlinkSync(scripts, join(dir, 'scripts'));
		const site = join(dir, 'site');
		mkdirSync(site);
		writeFileSync(join(site, 'index.html'), '<a href="missing/">x</a>');
		let out = '';
		let code = 0;
		try {
			out = execFileSync('node', [join(dir, 'scripts', 'check-links.mjs'), site], { encoding: 'utf8' });
		} catch (e) {
			code = e.status;
			out = e.stdout;
		}
		assert.equal(code, 1, out);
		assert.match(out, /1 broken/);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});
