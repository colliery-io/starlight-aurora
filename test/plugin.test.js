import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import starlightAurora, { auroraCss, auroraExpressiveCode, codeStyleOverrides } from '../index.js';

function setup(plugin, config) {
	let update = {};
	plugin.hooks['config:setup']({ config, updateConfig: (u) => (update = { ...update, ...u }) });
	return update;
}

const pkgFile = (spec) => fileURLToPath(new URL(`../${spec.replace('starlight-aurora/', '')}`, import.meta.url));

test('the plugin puts the Aurora CSS before the site CSS', () => {
	const update = setup(starlightAurora(), { customCss: ['./src/site.css'] });
	assert.deepEqual(update.customCss, [
		'starlight-aurora/styles/layers.css',
		'starlight-aurora/styles/aurora.css',
		'starlight-aurora/styles/theme.css',
		'./src/site.css',
	]);
});

test('a site with no custom CSS gets the Aurora CSS', () => {
	const update = setup(starlightAurora(), {});
	assert.equal(update.customCss.length, 3);
});

test('hyper is off by default and adds its stylesheet when on', () => {
	assert.ok(!auroraCss().some((f) => f.includes('hyper')));
	assert.ok(auroraCss({ hyper: true }).includes('starlight-aurora/styles/hyper.css'));
});

test('each stylesheet that the plugin names exists in the package', () => {
	for (const spec of auroraCss({ hyper: true })) assert.ok(existsSync(pkgFile(spec)), spec);
});

test('code blocks get the Aurora styles, and the site overrides win', () => {
	assert.deepEqual(auroraExpressiveCode(undefined).styleOverrides, codeStyleOverrides);
	const merged = auroraExpressiveCode({ themes: ['github-dark'], styleOverrides: { borderRadius: '0' } });
	assert.deepEqual(merged.themes, ['github-dark']);
	assert.equal(merged.styleOverrides.borderRadius, '0');
	assert.equal(merged.styleOverrides.codeFontFamily, 'var(--font-mono)');
});

test('a site with code blocks off keeps them off', () => {
	assert.equal(auroraExpressiveCode(false), false);
	assert.equal(setup(starlightAurora(), { expressiveCode: false }).expressiveCode, false);
});

test('theme.css has no raw colours: each value is an Aurora token', () => {
	const css = readFileSync(pkgFile('starlight-aurora/styles/theme.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
	const raw = css.match(/#[0-9a-f]{3,8}\b|\b(rgba?|hsla?|oklch|oklab|lab|lch)\(/gi);
	assert.equal(raw, null, `raw colours: ${raw}`);
});

test('theme.css maps each Starlight colour variable', () => {
	const css = readFileSync(pkgFile('starlight-aurora/styles/theme.css'), 'utf8');
	const required = ['white', 'gray-1', 'gray-2', 'gray-3', 'gray-4', 'gray-5', 'gray-6', 'gray-7', 'black',
		'accent-low', 'accent', 'accent-high', 'text', 'text-accent', 'text-invert', 'bg', 'bg-nav',
		'bg-sidebar', 'bg-inline-code', 'bg-accent', 'hairline-light', 'hairline', 'hairline-shade', 'backdrop-overlay'];
	for (const hue of ['blue', 'purple', 'orange', 'red', 'green']) required.push(`${hue}-low`, hue, `${hue}-high`);
	for (const name of required) assert.match(css, new RegExp(`--sl-color-${name}:\\s*var\\(--`), name);
});
