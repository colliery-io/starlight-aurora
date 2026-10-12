import { test } from 'node:test';
import assert from 'node:assert/strict';
import { C4_COLOURS, auroraC4Style } from '../c4-colours.js';

test("Mermaid's default C4 colours become Aurora tokens, and others stay", () => {
	assert.equal(auroraC4Style('fill:#08427B !important;stroke:#073B6F !important'), 'fill:var(--violet-bg) !important;stroke:var(--violet) !important');
	assert.equal(auroraC4Style('fill:#FFFFFF !important'), 'fill:var(--fg) !important');
	assert.equal(auroraC4Style('stroke:#444444'), 'stroke:var(--fg-2)');
	assert.equal(auroraC4Style('fill:#ff00aa'), 'fill:#ff00aa');
	assert.equal(auroraC4Style('stroke: none'), 'stroke: none');
});

test('each mapped value is an Aurora token, not a colour', () => {
	for (const [hex, token] of Object.entries(C4_COLOURS)) {
		assert.match(hex, /^#[0-9a-f]+$/);
		assert.match(token, /^var\(--[a-z0-9-]+\)$/);
	}
});
