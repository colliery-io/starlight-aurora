import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { differences, rawUrl } from '../scripts/vendor.mjs';

const source = JSON.parse(readFileSync(new URL('../vendor/aurora/source.json', import.meta.url), 'utf8'));

test('identical files have no differences', () => {
	assert.deepEqual(differences({ 'a.css': 'x' }, { 'a.css': 'x' }), []);
});

test('a changed or missing file is a difference', () => {
	assert.deepEqual(differences({ 'a.css': 'x', 'b.css': 'y' }, { 'a.css': 'x2', 'b.css': 'y', 'c.css': 'z' }), ['a.css', 'c.css']);
});

test('the raw URL names the repository, the ref and the path', () => {
	assert.equal(
		rawUrl(source, 'v1.0.0', 'tokens.css'),
		'https://raw.githubusercontent.com/colliery-io/aurora/v1.0.0/aurora-leptos/style/tokens.css',
	);
});

test('source.json records a tag, a full commit and the three files', () => {
	assert.match(source.tag, /^v\d+\.\d+\.\d+$/);
	assert.match(source.commit, /^[0-9a-f]{40}$/);
	assert.deepEqual(source.files, ['tokens.css', 'fonts.css', 'hyper.css']);
});
