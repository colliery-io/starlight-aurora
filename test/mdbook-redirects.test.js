import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MDBOOK_EXTRA, redirectFiles, redirectPage } from '../mdbook-redirects.js';

const noDefaults = { 'introduction.html': null, 'print.html': null };

test('each page gets its old .html address, with a relative target', () => {
	assert.deepEqual(redirectFiles(['', 'how-to/install-with-helm/', 'reference/', '404/'], noDefaults), {
		'how-to/install-with-helm.html': 'install-with-helm/',
		'reference.html': 'reference/',
	});
});

test('extra adds to the mdBook defaults, and null removes one', () => {
	assert.equal(redirectFiles([])['introduction.html'], './');
	assert.deepEqual(redirectFiles([], { 'intro.html': './' }), { ...MDBOOK_EXTRA, 'intro.html': './' });
	assert.deepEqual(redirectFiles([], { 'print.html': null }), { 'introduction.html': './' });
	assert.deepEqual(Object.keys(MDBOOK_EXTRA).sort(), ['introduction.html', 'print.html']);
});

test('an extra entry wins over the address made from a page', () => {
	assert.equal(redirectFiles(['how-to/old/'], { 'how-to/old.html': '../new/' })['how-to/old.html'], '../new/');
});

test('the page keeps the anchor with a script, and has a refresh for no script', () => {
	const html = redirectPage('install-with-helm/');
	assert.match(html, /location\.replace\("install-with-helm\/" \+ location\.hash\)/);
	assert.match(html, /http-equiv="refresh" content="0; url=install-with-helm\/"/);
	assert.match(html, /noindex/);
});
