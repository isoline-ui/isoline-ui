import assert from 'node:assert/strict';
import test from 'node:test';
import {
  themes,
  extendTheme,
  resolveThemeColors,
  ROLE_VARIABLES,
  rippleColors,
} from '../packages/react-native/src/theme.ts';

test('every brand in both appearances supplies all native colour roles', () => {
  for (const brand of Object.values(themes))
    for (const theme of Object.values(brand)) {
      const colors = resolveThemeColors(theme);
      assert.equal(Object.keys(colors).length, Object.keys(ROLE_VARIABLES).length);
      for (const color of Object.values(colors)) {
        assert.match(color, /^hsl\([\d.\s%+-]+\)$/);
      }
    }
});

test('brand accents stay distinct while the role contract stays identical', () => {
  for (const scheme of ['light', 'dark'] as const) {
    const colors = Object.values(themes).map((brand) => resolveThemeColors(brand[scheme]));
    assert.equal(new Set(colors.map((color) => color.primary)).size, 3);
    for (const color of colors) assert.deepEqual(Object.keys(color), Object.keys(colors[0]!));
  }
});

test('customisation does not mutate a preset or discard its other roles', () => {
  const original = themes.inboki.light;
  const primary = original.tokens['--primary'];
  const custom = extendTheme(original, {
    tokens: { '--primary': '210 90% 50%' },
    typography: { title: { fontFamily: 'Custom' } },
  });
  assert.equal(original.tokens['--primary'], primary);
  assert.equal(resolveThemeColors(custom).primary, 'hsl(210 90% 50%)');
  assert.equal(resolveThemeColors(custom).surface, resolveThemeColors(original).surface);
  assert.equal(custom.typography?.title?.fontFamily, 'Custom');
});

test('a broken theme fails clearly instead of silently losing native colours', () => {
  assert.throws(
    () => resolveThemeColors({ name: 'broken', scheme: 'light', tokens: {} }),
    /missing theme token --primary/,
  );
});

test('ripple contrast changes with appearance', () => {
  assert.equal(rippleColors('light').onNeutral, rippleColors('dark').onTonal);
  assert.notEqual(rippleColors('light').onNeutral, rippleColors('dark').onNeutral);
});

test('overriding a typography metric retains the brand font', () => {
  const custom = extendTheme(themes.atlas.light, { typography: { title: { fontSize: 36 } } });
  assert.equal(custom.typography?.title?.fontFamily, 'SpaceGrotesk_700Bold');
  assert.equal(custom.typography?.title?.fontSize, 36);
});
