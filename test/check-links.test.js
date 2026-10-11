import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pageUrl, references } from '../scripts/check-links.mjs';

test('a page URL drops index.html and keeps the base', () => {
	assert.equal(pageUrl('index.html', '/'), '/');
	assert.equal(pageUrl('how-to/x/index.html', '/p/'), '/p/how-to/x/');
	assert.equal(pageUrl('how-to/x.html', '/p/'), '/p/how-to/x.html');
});

test('references keep internal links and drop external ones', () => {
	const html = '<a href="../a/">a</a><a href="https://x.org/">x</a><img src="/i.svg"><a href="mailto:a@b">m</a><a href="//cdn/x">c</a><meta http-equiv="refresh" content="0; url=b/">';
	assert.deepEqual(references(html), ['../a/', '/i.svg', 'b/']);
});
