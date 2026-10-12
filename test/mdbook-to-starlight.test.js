import { test } from 'node:test';
import assert from 'node:assert/strict';
import { convertPage, escapeMdx, outputOf, relativeRoute, routeOf, sidebarFromSummary } from '../scripts/mdbook-to-starlight.mjs';

test('routes and output files', () => {
	assert.equal(routeOf('how-to/install.md'), 'how-to/install/');
	assert.equal(routeOf('how-to/README.md'), 'how-to/');
	assert.equal(routeOf('README.md'), '');
	assert.equal(outputOf('how-to/README.md'), 'how-to/index.md');
	assert.equal(outputOf('README.md'), 'index.md');
	assert.equal(relativeRoute('how-to/install/', 'reference/cli/'), '../../reference/cli/');
	assert.equal(relativeRoute('how-to/', 'how-to/install/'), 'install/');
	assert.equal(relativeRoute('how-to/install/', ''), '../../');
});

test('the first heading becomes the title, and a rule after it goes', () => {
	const out = convertPage('# Set `up` a board\n\n---\n\nFirst section.\n', 'how-to/board.md');
	assert.match(out, /^---\ntitle: "Set up a board"\n---\n\nFirst section\.\n$/);
});

test('links to pages become relative routes, with their anchors; other links stay', () => {
	const out = convertPage('# T\n\nSee [cli](../reference/cli.md#flags), [old](other.html), [web](https://x.org/a.md) and `[code](x.md)`.\n', 'how-to/board.md');
	assert.match(out, /\[cli\]\(\.\.\/\.\.\/reference\/cli\/#flags\)/);
	assert.match(out, /\[old\]\(\.\.\/other\/\)/);
	assert.match(out, /\[web\]\(https:\/\/x\.org\/a\.md\)/);
	assert.match(out, /`\[code\]\(x\.md\)`/);
});

test('existing front matter is kept, with the title set', () => {
	const out = convertPage('---\ndescription: d\n---\n# Title\n\nText\n', 'a.md');
	assert.match(out, /^---\ntitle: "Title"\ndescription: d\n---\n/);
});

test('escapeMdx changes prose only', () => {
	assert.equal(escapeMdx('a <1 000 and {x} and <b>bold</b>\n```\n<1 {y}\n```\n`{z}`'), 'a &lt;1 000 and \\{x\\} and <b>bold</b>\n```\n<1 {y}\n```\n`{z}`');
});

test('SUMMARY.md becomes a sidebar, with parts and nested pages', () => {
	const summary = '# Summary\n\n[Introduction](README.md)\n\n# Guides\n\n- [Install](how-to/install.md)\n- [Boards](how-to/README.md)\n  - [Set up](how-to/board.md)\n- [Draft]()\n';
	assert.deepEqual(sidebarFromSummary(summary), [
		{ label: 'Introduction', slug: 'index' },
		{
			label: 'Guides',
			items: [
				{ label: 'Install', slug: 'how-to/install' },
				{ label: 'Boards', items: [{ label: 'Overview', slug: 'how-to' }, { label: 'Set up', slug: 'how-to/board' }] },
				{ label: 'Draft', items: [] },
			],
		},
	]);
});

test('a ## heading is a group inside the # part above it', () => {
	const summary = '# Summary\n\n# How-to guides\n\n## For operators\n\n- [Install](how-to/install.md)\n\n## For authors\n\n- [Write](how-to/write.md)\n';
	assert.deepEqual(sidebarFromSummary(summary), [
		{
			label: 'How-to guides',
			items: [
				{ label: 'For operators', items: [{ label: 'Install', slug: 'how-to/install' }] },
				{ label: 'For authors', items: [{ label: 'Write', slug: 'how-to/write' }] },
			],
		},
	]);
});
