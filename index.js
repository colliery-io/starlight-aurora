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
				updateConfig({
					customCss: [...auroraCss(opts), ...(config.customCss ?? [])],
					expressiveCode: auroraExpressiveCode(config.expressiveCode),
				});
			},
		},
	};
}
