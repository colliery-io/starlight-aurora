// Shared by the check scripts: how they read their arguments, and how they
// know that Node runs them as a script (and not as an import in a test).
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * The arguments of a check script: one site folder (the first argument that
 * is not an option or the value of --base), --base <path> (with a trailing
 * slash), and the other --flags. Any order.
 */
export function parseArgs(args, defaultDist = 'docs/dist') {
	const flags = new Set();
	let base = '/';
	let dist;
	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		if (a === '--base') {
			base = args[++i] ?? '/';
		} else if (a.startsWith('--')) {
			flags.add(a.slice(2));
		} else if (dist === undefined) {
			dist = a;
		}
	}
	if (!base.endsWith('/')) base += '/';
	if (!base.startsWith('/')) base = `/${base}`;
	return { dist: dist ?? defaultDist, base, flags };
}

/**
 * True when Node runs this module as the script. Compares real paths: on
 * macOS /tmp is a link to /private/tmp, and a plain string compare is false,
 * so the script would do nothing and exit 0.
 */
export function isMain(importMetaUrl, argv1 = process.argv[1]) {
	if (!argv1) return false;
	try {
		return realpathSync(argv1) === realpathSync(fileURLToPath(importMetaUrl));
	} catch {
		return false;
	}
}
