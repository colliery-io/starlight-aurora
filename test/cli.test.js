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

test('--name=value options are read, and --base=/x/ works too', async () => {
	const { parseArgs } = await import('../scripts/cli.mjs');
	const got = parseArgs(['site', '--shard=2/4', '--jobs=8', '--base=/x', '--hyper']);
	assert.deepEqual(got.values, { shard: '2/4', jobs: '8' });
	assert.equal(got.base, '/x/');
	assert.equal(got.dist, 'site');
	assert.ok(got.flags.has('hyper'));
});

test('a shard takes every nth page, and the shards cover each page once', async () => {
	const { shard } = await import('../scripts/cli.mjs');
	const list = ['a', 'b', 'c', 'd', 'e'];
	assert.deepEqual(shard(list, '1/2'), ['a', 'c', 'e']);
	assert.deepEqual(shard(list, '2/2'), ['b', 'd']);
	assert.deepEqual(shard(list, undefined), list);
	assert.deepEqual([...shard(list, '1/3'), ...shard(list, '2/3'), ...shard(list, '3/3')].sort(), list);
	assert.throws(() => shard(list, '3/2'), /i\/n/);
});

test('a redirect page is told from a real page', async () => {
	const { isRedirectPage } = await import('../scripts/cli.mjs');
	const { redirectPage } = await import('../redirects.js');
	assert.equal(isRedirectPage(redirectPage('x/')), true);
	assert.equal(isRedirectPage('<meta http-equiv="refresh" content="0;url=/x/"><meta name="robots" content="noindex">'), true);
	assert.equal(isRedirectPage('<html><head><title>A page</title></head></html>'), false);
	assert.equal(isRedirectPage('<meta name="robots" content="noindex">'), false);
});
