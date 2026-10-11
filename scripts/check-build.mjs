// Checks a built site: Aurora's layer must rank below Starlight's, so the
// first layer that the site's CSS names is aurora-vendor.
//
//   node scripts/check-build.mjs docs/dist
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export function firstLayer(css) {
	return css.match(/@layer\s+([\w-]+)/)?.[1];
}

const dist = process.argv[2] ?? 'docs/dist';
const dir = join(dist, '_astro');
const sheets = readdirSync(dir).filter((f) => f.endsWith('.css')).map((f) => readFileSync(join(dir, f), 'utf8'));
const main = sheets.find((css) => css.includes('aurora-vendor'));
if (!main) {
	console.error(`${dist}: no stylesheet has the aurora-vendor layer`);
	process.exit(1);
}
const first = firstLayer(main);
if (first !== 'aurora-vendor') {
	console.error(`${dist}: the first layer is ${first}, not aurora-vendor; Aurora's base rules would beat Starlight's`);
	process.exit(1);
}
console.log(`${dist}: aurora-vendor is the first layer`);
