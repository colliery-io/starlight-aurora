// Mermaid's C4 diagrams in Aurora's colours.
//
// Mermaid draws C4 shapes with inline styles such as
// `fill:#08427B !important; stroke:#073B6F !important` and white text
// (`fill:#FFFFFF !important`). An inline `!important` beats any stylesheet, so
// styles/mermaid.css cannot reach them. After Mermaid draws a C4 diagram, this
// script swaps Mermaid's default C4 colours in those styles for Aurora's
// tokens. The tokens are CSS variables, so a change of theme recolours the
// diagram at once. Colours that a diagram sets itself (UpdateElementStyle) are
// not Mermaid's defaults, and are left alone.
//
// The starlight-aurora plugin adds this script to each page.

/** Mermaid's default C4 colours (mermaid 11) → Aurora tokens. */
export const C4_COLOURS = {
	// People, systems, containers, components: tinted fills, hue borders.
	'#08427b': 'var(--violet-bg)', // person
	'#073b6f': 'var(--violet)',
	'#1168bd': 'var(--ice-bg)', // system
	'#3c7fc0': 'var(--ice)', // system and container borders
	'#438dd5': 'var(--teal-bg)', // container
	'#85bbf0': 'var(--teal-bg)', // component
	'#78a8d8': 'var(--teal)',
	// External ones: muted fills, control borders.
	'#686868': 'var(--muted-bg)',
	'#999999': 'var(--muted-bg)',
	'#b3b3b3': 'var(--muted-bg)',
	'#cccccc': 'var(--muted-bg)',
	'#8a8a8a': 'var(--border-control)',
	'#a6a6a6': 'var(--border-control)',
	'#bfbfbf': 'var(--border-control)',
	// Text on the shapes, relationship lines and their labels, boundaries.
	'#ffffff': 'var(--fg)',
	'#444444': 'var(--fg-2)',
	'#bbb': 'var(--border)',
};

const HEX = /#[0-9a-f]{3,8}\b/gi;

/** The style string with Mermaid's default C4 colours swapped for Aurora tokens. */
export function auroraC4Style(style) {
	return style.replace(HEX, (hex) => C4_COLOURS[hex.toLowerCase()] ?? hex);
}

/** Recolour one drawn C4 diagram. */
export function auroraC4(svg) {
	for (const el of svg.querySelectorAll('[style], [fill], [stroke]')) {
		const style = el.getAttribute('style');
		if (style) {
			const next = auroraC4Style(style);
			if (next !== style) el.setAttribute('style', next);
		}
		for (const attr of ['fill', 'stroke']) {
			const v = el.getAttribute(attr);
			if (v && C4_COLOURS[v.toLowerCase()]) el.setAttribute(attr, C4_COLOURS[v.toLowerCase()]);
		}
	}
}

function recolourAll(root) {
	for (const svg of root.querySelectorAll('svg[aria-roledescription="c4"]')) auroraC4(svg);
}

if (typeof document !== 'undefined') {
	// Mermaid draws after the page loads, and draws again when the theme
	// changes: watch for new diagrams.
	const start = () => {
		recolourAll(document);
		new MutationObserver((records) => {
			for (const r of records) {
				for (const n of r.addedNodes) {
					if (n.nodeType !== 1) continue;
					if (n.matches?.('svg[aria-roledescription="c4"]')) auroraC4(n);
					else recolourAll(n);
				}
			}
		}).observe(document.body, { childList: true, subtree: true });
	};
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
	else start();
}
