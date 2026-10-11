import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MDBOOK_EXTRA, redirectFiles, redirectPage } from '../mdbook-redirects.js';

test('each page gets its old .html address, with a relative target', () => {
	assert.deepEqual(redirectFiles(['', 'how-to/install-with-helm/', 'reference/', '404/'], {}), {
		'how-to/install-with-helm.html': 'install-with-helm/',
		'reference.html': 'reference/',
	});
});

test('the mdBook extras go to the home page by default, and a site can change them', () => {
	assert.equal(redirectFiles([])['introduction.html'], './');
	assert.deepEqual(redirectFiles([], { 'old.html': 'new/' }), { 'old.html': 'new/' });
	assert.deepEqual(Object.keys(MDBOOK_EXTRA).sort(), ['introduction.html', 'print.html']);
});

test('the page keeps the anchor with a script, and has a refresh for no script', () => {
	const html = redirectPage('install-with-helm/');
	assert.match(html, /location\.replace\("install-with-helm\/" \+ location\.hash\)/);
	assert.match(html, /http-equiv="refresh" content="0; url=install-with-helm\/"/);
	assert.match(html, /noindex/);
});
