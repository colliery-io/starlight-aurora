// starlight-aurora: Aurora, the Colliery design system, as a Starlight theme.

/** @typedef {{ hyper?: boolean }} AuroraOptions */

const PKG = 'starlight-aurora';

/** The stylesheets that the plugin adds, in order, before the site's own. */
export function auroraCss(options = {}) {
	const css = [`${PKG}/styles/layers.css`, `${PKG}/styles/aurora.css`];
	if (options.hyper) css.push(`${PKG}/styles/hyper.css`);
	css.push(`${PKG}/styles/theme.css`);
	return css;
}

/**
 * Starlight components that the plugin replaces. Only hyper needs any. With
 * starlight-versions too, the theme select also shows the version select.
 */
export function auroraComponents(options = {}, { versions = false } = {}) {
	if (!options.hyper) return {};
	return {
		ThemeProvider: `${PKG}/components/ThemeProvider.astro`,
		ThemeSelect: `${PKG}/components/${versions ? 'ThemeSelectVersions' : 'ThemeSelect'}.astro`,
	};
}

/** The names that the starlight-versions plugin gives itself. */
const VERSIONS_PLUGIN = new Set(['starlight-versions-plugin', 'starlight-versions']);

/** True when the site also uses the starlight-versions plugin. */
export function usesVersions(config) {
	return (config.plugins ?? []).some((p) => VERSIONS_PLUGIN.has(p?.name));
}

/** A component that starlight-versions set, which the plugin may take over. */
const fromVersions = (path) => typeof path === 'string' && path.startsWith('starlight-versions/');

/** Code-block styles from Aurora's tokens. The site's own overrides win. */
export const codeStyleOverrides = {
	codeFontFamily: 'var(--font-mono)',
	uiFontFamily: 'var(--font-sans)',
	borderRadius: 'var(--radius-md)',
};

/**
 * Starlight's `expressiveCode` option with Aurora's code-block styles merged
 * in. A site that turns code blocks off (false) keeps them off.
 */
export function auroraExpressiveCode(userConfig) {
	if (userConfig === false) return false;
	const user = userConfig === true || userConfig === undefined ? {} : userConfig;
	return {
		...user,
		styleOverrides: { ...codeStyleOverrides, ...(user.styleOverrides ?? {}) },
	};
}

/**
 * The Starlight plugin.
 *
 * @param {AuroraOptions} [options]
 * @returns {import('@astrojs/starlight/types').StarlightPlugin}
 */
export default function starlightAurora(options = {}) {
	const opts = { hyper: false, ...options };
	return {
		name: PKG,
		hooks: {
			'config:setup'({ config, updateConfig }) {
				const components = auroraComponents(opts, { versions: usesVersions(config) });
				for (const name of Object.keys(components)) {
					const theirs = config.components?.[name];
					if (theirs && !fromVersions(theirs)) {
						throw new Error(`starlight-aurora: hyper replaces the ${name} component, and the site replaces it too. Remove one.`);
					}
				}
				updateConfig({
					customCss: [...auroraCss(opts), ...(config.customCss ?? [])],
					expressiveCode: auroraExpressiveCode(config.expressiveCode),
					components: { ...config.components, ...components },
				});
			},
		},
	};
}
