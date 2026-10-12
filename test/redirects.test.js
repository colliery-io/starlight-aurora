import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { redirectFile, relativeTarget, writeRedirects } from '../redirects.js';

test('a relative target climbs out of the old folder', () => {
	assert.equal(relativeTarget('guides/install/', 'how-to/install/'), '../../how-to/install/');
	assert.equal(relativeTarget('api/', 'reference/'), '../reference/');
	assert.equal(relativeTarget('old/page.html', 'how-to/install/'), '../how-to/install/');
	assert.equal(relativeTarget('top.html', 'how-to/install/'), 'how-to/install/');
	assert.equal(relativeTarget('/api/', ''), '../');
	assert.equal(relativeTarget('top.html', ''), './');
});

test('a folder address is served by its index.html', () => {
	assert.equal(redirectFile('guides/install/'), 'guides/install/index.html');
	assert.equal(redirectFile('/api/'), 'api/index.html');
	assert.equal(redirectFile('old/page.html'), 'old/page.html');
});

test('writeRedirects writes pages and never writes over a page of the site', async () => {
	const dir = mkdtempSync(join(tmpdir(), 'sa-redir-'));
	try {
		mkdirSync(join(dir, 'kept'));
		writeFileSync(join(dir, 'kept', 'index.html'), 'real page');
		const n = await writeRedirects(dir, [
			['guides/install/', '../../how-to/install/'],
			['kept/', '../elsewhere/'],
		]);
		assert.equal(n, 1);
		assert.match(readFileSync(join(dir, 'guides', 'install', 'index.html'), 'utf8'), /url=\.\.\/\.\.\/how-to\/install\//);
		assert.equal(readFileSync(join(dir, 'kept', 'index.html'), 'utf8'), 'real page');
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});
