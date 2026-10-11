import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HUES, statusHue } from '../components/status.js';

test("Aurora's statuses have Aurora's hues", () => {
	assert.equal(statusHue('running'), 'ice');
	assert.equal(statusHue('completed'), 'ok');
	assert.equal(statusHue('failed'), 'bad');
	assert.equal(statusHue('scheduled'), 'violet');
	assert.equal(statusHue('pending'), 'muted');
	assert.equal(statusHue('paused'), 'muted');
	assert.equal(statusHue('cancelled'), 'gold');
	assert.equal(statusHue('canceled'), 'gold');
	assert.equal(statusHue('skipped'), 'skip');
});

test('statuses are case-insensitive, and an unknown status is muted', () => {
	assert.equal(statusHue('RUNNING'), 'ice');
	assert.equal(statusHue('healthy'), 'muted');
});

test('an explicit hue wins, and an unknown hue is an error', () => {
	assert.equal(statusHue('healthy', 'ok'), 'ok');
	assert.equal(statusHue('failed', 'teal'), 'teal');
	assert.throws(() => statusHue('x', 'orange'), /orange/);
});

test('each hue has a text token and a fill token in the vendored Aurora CSS', async () => {
	const { readFileSync } = await import('node:fs');
	const css = readFileSync(new URL('../vendor/aurora/tokens.css', import.meta.url), 'utf8');
	for (const h of HUES) {
		assert.match(css, new RegExp(`--${h}-fg:`), `${h}-fg`);
		assert.match(css, new RegExp(`--${h}-bg:`), `${h}-bg`);
	}
});
