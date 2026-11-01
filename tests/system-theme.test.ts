import assert from 'node:assert/strict';
import test from 'node:test';
import { applySystemPalette } from '../packages/native/src/theme.ts';
import { themes } from '../packages/react-native/src/theme.ts';
import { parseSystemPalette } from '../packages/native/src/dynamic-color.ts';

test('unsupported devices preserve the exact brand theme', () => {
  assert.equal(applySystemPalette(themes.cyan.dark, null), themes.cyan.dark);
});

test('system palette overrides visual roles while preserving semantic colors and typography', () => {
  const stops = Array.from({ length: 13 }, () => '#336699');
  const palette = parseSystemPalette({
    accent1: stops,
    accent2: stops,
    accent3: stops,
    neutral1: stops,
    neutral2: stops,
  })!;
  for (const scheme of ['light', 'dark'] as const) {
    const base = themes.cyan[scheme];
    const before = { ...base.tokens };
    const result = applySystemPalette(base, palette);
    assert.equal(result.scheme, scheme);
    assert.equal(result.typography, base.typography);
    assert.equal(result.tokens['--primary'], '210 50% 40%');
    assert.equal(result.tokens['--destructive'], base.tokens['--destructive']);
    assert.equal(result.tokens['--success'], base.tokens['--success']);
    assert.deepEqual(base.tokens, before);
  }
});
