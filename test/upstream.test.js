import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { changed, sha256 } from '../scripts/check-upstream.mjs';

const record = JSON.parse(readFileSync(new URL('../components/upstream.json', import.meta.url), 'utf8'));

test('the same files are not changed', () => {
	assert.deepEqual(changed({ files: { a: sha256('x') } }, { a: sha256('x') }), []);
});

test('a changed or missing file is changed', () => {
	const rec = { files: { a: sha256('x'), b: sha256('y') } };
	assert.deepEqual(changed(rec, { a: sha256('x2') }), ['a', 'b']);
});

test('the record names the two components that hyper copies, with full hashes', () => {
	assert.deepEqual(Object.keys(record.files).sort(), ['dist/components/ThemeProvider.astro', 'dist/components/ThemeSelect.astro']);
	for (const hash of Object.values(record.files)) assert.match(hash, /^[0-9a-f]{64}$/);
	assert.match(record.version, /^\d+\.\d+\.\d+$/);
});
