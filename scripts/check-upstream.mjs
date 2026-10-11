// Checks the Starlight components that hyper copies (components/ThemeProvider
// and components/ThemeSelect) against the newest Starlight release. It fails
// when Starlight has changed either of them since the copy, so the copy can be
// brought up to date.
//
//   node scripts/check-upstream.mjs            the newest release
//   node scripts/check-upstream.mjs 0.43.0     one release
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RECORD = fileURLToPath(new URL('../components/upstream.json', import.meta.url));

export const sha256 = (text) => createHash('sha256').update(text).digest('hex');

/** The recorded files whose hash differs from the release's, or that it lacks. */
export function changed(record, release) {
	return Object.entries(record.files)
		.filter(([file, hash]) => release[file] !== hash)
		.map(([file]) => file);
}

function releaseFiles(pkg, version, files) {
	const dir = mkdtempSync(join(tmpdir(), 'sa-upstream-'));
	try {
		const tarball = execFileSync('npm', ['pack', `${pkg}@${version}`, '--silent', '--pack-destination', dir], { encoding: 'utf8' }).trim().split('\n').pop();
		execFileSync('tar', ['-xzf', join(dir, tarball), '-C', dir]);
		const out = {};
		for (const file of files) {
			try {
				out[file] = sha256(readFileSync(join(dir, 'package', file)));
			} catch {
				out[file] = undefined;
			}
		}
		return out;
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const record = JSON.parse(readFileSync(RECORD, 'utf8'));
	const version = process.argv[2] ?? execFileSync('npm', ['view', record.package, 'version'], { encoding: 'utf8' }).trim();
	const bad = changed(record, releaseFiles(record.package, version, Object.keys(record.files)));
	if (bad.length) {
		console.error(`${record.package} ${version} changed, since ${record.version}: ${bad.join(', ')}.`);
		console.error('Bring components/ThemeProvider.astro and components/ThemeSelect.astro up to date, then record the new hashes in components/upstream.json.');
		console.error('See https://colliery-io.github.io/starlight-aurora/how-to/starlight-update/');
		process.exit(1);
	}
	console.log(`${record.package} ${version}: the components that hyper copies are the same as in ${record.version}`);
}
