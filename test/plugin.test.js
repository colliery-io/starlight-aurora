import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import starlightAurora, { auroraComponents, auroraCss, auroraExpressiveCode, codeStyleOverrides } from '../index.js';

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

test('hyper off replaces no Starlight component', () => {
	assert.deepEqual(auroraComponents(), {});
	assert.deepEqual(setup(starlightAurora(), {}).components, {});
});

test('hyper on replaces the theme provider and select, and keeps the site components', () => {
	const update = setup(starlightAurora({ hyper: true }), { components: { Footer: './src/Footer.astro' } });
	assert.equal(update.components.ThemeSelect, 'starlight-aurora/components/ThemeSelect.astro');
	assert.equal(update.components.ThemeProvider, 'starlight-aurora/components/ThemeProvider.astro');
	assert.equal(update.components.Footer, './src/Footer.astro');
	for (const spec of Object.values(auroraComponents({ hyper: true }))) assert.ok(existsSync(pkgFile(spec)), spec);
});

test('hyper on and a site ThemeSelect of its own is an error', () => {
	assert.throws(() => setup(starlightAurora({ hyper: true }), { components: { ThemeSelect: './x.astro' } }), /ThemeSelect/);
});

// The name that starlight-versions 0.10 gives itself.
const versionsPlugin = { name: 'starlight-versions-plugin', hooks: {} };

test('with hyper and starlight-versions, the theme select also shows the versions', () => {
	const update = setup(starlightAurora({ hyper: true }), { plugins: [versionsPlugin] });
	assert.equal(update.components.ThemeSelect, 'starlight-aurora/components/ThemeSelectVersions.astro');
	assert.ok(existsSync(pkgFile(update.components.ThemeSelect)));
});

test('with hyper, the plugin takes over the ThemeSelect that starlight-versions set first', () => {
	const update = setup(starlightAurora({ hyper: true }), {
		plugins: [versionsPlugin],
		components: { ThemeSelect: 'starlight-versions/overrides/ThemeSelect.astro', Search: 'starlight-versions/overrides/Search.astro' },
	});
	assert.equal(update.components.ThemeSelect, 'starlight-aurora/components/ThemeSelectVersions.astro');
	assert.equal(update.components.Search, 'starlight-versions/overrides/Search.astro');
});

test('without hyper, the plugin leaves the components of starlight-versions alone', () => {
	const update = setup(starlightAurora(), { plugins: [versionsPlugin], components: { ThemeSelect: 'starlight-versions/overrides/ThemeSelect.astro' } });
	assert.equal(update.components.ThemeSelect, 'starlight-versions/overrides/ThemeSelect.astro');
});

