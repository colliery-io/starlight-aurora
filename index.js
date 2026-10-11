// starlight-aurora: Aurora, the Colliery design system, as a Starlight theme.

/** @typedef {{ hyper?: boolean }} AuroraOptions */

const PKG = 'starlight-aurora';

/** The stylesheets that the plugin adds, in order, before the site's own. */
export function auroraCss(options = {}) {
	const css = [`${PKG}/styles/layers.css`, `${PKG}/styles/aurora.css`];
	if (options.hyper) css.push(`${PKG}/styles/hyper.css`);
	return css;
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
				});
			},
		},
	};
}
