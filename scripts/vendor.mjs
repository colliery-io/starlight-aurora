// Checks the vendored Aurora CSS against the Aurora tag in source.json, or
// moves it to a new tag.
//
//   node scripts/vendor.mjs check
//   node scripts/vendor.mjs update <tag>
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const VENDOR_DIR = fileURLToPath(new URL('../vendor/aurora/', import.meta.url));
const SOURCE = join(VENDOR_DIR, 'source.json');

export function rawUrl(source, ref, file) {
	return `https://raw.githubusercontent.com/${source.repo}/${ref}/${source.path}/${file}`;
}

/** Names of the files whose local text is not the same as the upstream text. */
export function differences(local, upstream) {
	return Object.keys(upstream).filter((file) => local[file] !== upstream[file]);
}

async function fetchText(url) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
	return res.text();
}

async function fetchAll(source, ref) {
	const out = {};
	for (const file of source.files) out[file] = await fetchText(rawUrl(source, ref, file));
	return out;
}

async function readLocal(source) {
	const out = {};
	for (const file of source.files) out[file] = await readFile(join(VENDOR_DIR, file), 'utf8');
	return out;
}

function commitOf(repo, tag) {
	const out = execFileSync('git', ['ls-remote', `https://github.com/${repo}.git`, `refs/tags/${tag}^{}`, `refs/tags/${tag}`], { encoding: 'utf8' });
	const lines = out.trim().split('\n').filter(Boolean);
	// An annotated tag lists the peeled commit as `<tag>^{}`; prefer it.
	const line = lines.find((l) => l.endsWith('^{}')) ?? lines[0];
	if (!line) throw new Error(`${repo}: no tag ${tag}`);
	return line.split('\t')[0];
}

async function check() {
	const source = JSON.parse(await readFile(SOURCE, 'utf8'));
	const commit = commitOf(source.repo, source.tag);
	if (commit !== source.commit) {
		throw new Error(`${source.repo} tag ${source.tag} is commit ${commit}, but source.json records ${source.commit}`);
	}
	const bad = differences(await readLocal(source), await fetchAll(source, source.commit));
	if (bad.length) {
		throw new Error(`vendor/aurora differs from ${source.repo}@${source.tag}: ${bad.join(', ')}. Run: npm run vendor:update -- ${source.tag}`);
	}
	console.log(`vendor/aurora matches ${source.repo}@${source.tag} (${source.commit.slice(0, 7)})`);
}

async function update(tag) {
	if (!tag) throw new Error('usage: vendor.mjs update <tag>');
	const source = JSON.parse(await readFile(SOURCE, 'utf8'));
	const commit = commitOf(source.repo, tag);
	const files = await fetchAll(source, commit);
	for (const [file, text] of Object.entries(files)) await writeFile(join(VENDOR_DIR, file), text);
	await writeFile(SOURCE, JSON.stringify({ ...source, tag, commit }, null, 2) + '\n');
	console.log(`vendor/aurora is now ${source.repo}@${tag} (${commit.slice(0, 7)})`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const [cmd, arg] = process.argv.slice(2);
	const run = cmd === 'check' ? check() : cmd === 'update' ? update(arg) : Promise.reject(new Error('usage: vendor.mjs check | update <tag>'));
	run.catch((err) => {
		console.error(err.message);
		process.exit(1);
	});
}
