// Aurora's status hues (aurora-leptos src/tokens.rs, status_color).

/** The hues that have a text token and a fill token. */
export const HUES = ['ice', 'teal', 'violet', 'gold', 'ok', 'bad', 'skip', 'muted'];

const STATUS_HUE = {
	running: 'ice',
	completed: 'ok',
	failed: 'bad',
	scheduled: 'violet',
	pending: 'muted',
	paused: 'muted',
	cancelled: 'gold',
	canceled: 'gold',
	skipped: 'skip',
};

/**
 * The hue of a status badge. An explicit hue wins; else Aurora's map of
 * statuses, case-insensitive; else muted, as in Aurora.
 */
export function statusHue(status, hue) {
	if (hue !== undefined) {
		if (!HUES.includes(hue)) throw new Error(`StatusBadge: hue "${hue}" is not one of ${HUES.join(', ')}`);
		return hue;
	}
	return STATUS_HUE[String(status).toLowerCase()] ?? 'muted';
}
