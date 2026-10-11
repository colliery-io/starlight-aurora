import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import starlightAurora, { auroraCss } from '../index.js';

function setup(plugin, config) {
	let update = {};
	plugin.hooks['config:setup']({ config, updateConfig: (u) => (update = { ...update, ...u }) });
	return update;
}

test('the plugin puts the Aurora CSS before the site CSS', () => {
	const update = setup(starlightAurora(), { customCss: ['./src/site.css'] });
	assert.deepEqual(update.customCss, [
		'starlight-aurora/styles/layers.css',
		'starlight-aurora/styles/aurora.css',
		'./src/site.css',
	]);
});

test('a site with no custom CSS gets the Aurora CSS', () => {
	const update = setup(starlightAurora(), {});
	assert.equal(update.customCss.length, 2);
});

test('hyper is off by default and adds its stylesheet when on', () => {
	assert.ok(!auroraCss().some((f) => f.includes('hyper')));
	assert.ok(auroraCss({ hyper: true }).includes('starlight-aurora/styles/hyper.css'));
});

test('each stylesheet that the plugin names exists in the package', () => {
	for (const spec of auroraCss({ hyper: true })) {
		const path = fileURLToPath(new URL(`../${spec.replace('starlight-aurora/', '')}`, import.meta.url));
		assert.ok(existsSync(path), spec);
	}
});
