import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PALETTE_TONES,
  dynamicRoles,
  hexToHslTriplet,
  hexToRgb,
  hexToLab,
  hexToHsl,
  paletteTone,
  parseSystemPalette,
  samePalette,
} from '../packages/native/src/dynamic-color.ts';

/** A palette of pure greys: tone T is the sRGB grey whose L* is T. */
const GREYS = [
  '#ffffff',
  '#fcfcfc',
  '#eeeeee',
  '#e2e2e2',
  '#c6c6c6',
  '#ababab',
  '#919191',
  '#777777',
  '#5e5e5e',
  '#474747',
  '#303030',
  '#1b1b1b',
  '#000000',
];

/** A blue accent palette in the shape Android reports it. */
const BLUES = [
  '#ffffff',
  '#fefbff',
  '#eef0ff',
  '#dbe1ff',
  '#b4c5ff',
  '#8aa8ff',
  '#5e8bf6',
  '#4071d9',
  '#2059c0',
  '#00429a',
  '#002d6e',
  '#001946',
  '#000000',
];

function palette() {
  return {
    accent1: [...BLUES],
    accent2: [...GREYS],
    accent3: [...BLUES],
    neutral1: [...GREYS],
    neutral2: [...GREYS],
  };
}

test('a complete palette parses, lower-cased', () => {
  const raw = palette();
  raw.accent1[0] = '#FFFFFF';
  const parsed = parseSystemPalette(raw);
  assert.ok(parsed);
  assert.equal(parsed.accent1[0], '#ffffff');
  assert.equal(parsed.neutral2.length, PALETTE_TONES.length);
});

test('anything short of five complete palettes is refused whole', () => {
  assert.equal(parseSystemPalette(null), null);
  assert.equal(parseSystemPalette('#ffffff'), null);

  const missing: Record<string, unknown> = palette();
  delete missing.neutral2;
  assert.equal(parseSystemPalette(missing), null);

  const short = palette();
  short.accent3 = short.accent3.slice(1);
  assert.equal(parseSystemPalette(short), null);

  const invalid: Record<string, unknown[]> = palette();
  invalid.accent2[4] = 0xff00ff;
  assert.equal(parseSystemPalette(invalid), null);

  const malformed = palette();
  malformed.neutral1[3] = 'rgb(1, 2, 3)';
  assert.equal(parseSystemPalette(malformed), null);
});

test('a tone on a stop is that stop exactly', () => {
  PALETTE_TONES.forEach((tone, index) => {
    assert.equal(paletteTone(BLUES, tone), BLUES[index]);
  });
});

test('a tone between stops lands between them, darker as the tone falls', () => {
  const at96 = paletteTone(GREYS, 96);
  const at94 = paletteTone(GREYS, 94);
  const at11 = paletteTone(GREYS, 11);
  const at6 = paletteTone(GREYS, 6);

  const grey = (hex: string) => parseInt(hex.slice(1, 3), 16);
  assert.ok(
    grey(GREYS[1]) > grey(at96) && grey(at96) > grey(at94) && grey(at94) > grey(GREYS[3]),
  );
  assert.ok(grey(GREYS[11]) < grey(at11) && grey(at11) < grey(GREYS[10]));
  assert.ok(grey(GREYS[12]) < grey(at6) && grey(at6) < grey(GREYS[11]));

  // Grey stays grey: chroma is interpolated too, and both ends have none.
  for (const hex of [at96, at94, at11, at6]) {
    assert.equal(hex.slice(1, 3), hex.slice(3, 5));
    assert.equal(hex.slice(3, 5), hex.slice(5, 7));
  }
});

test('the accent roles follow the Material 3 tones', () => {
  const parsed = parseSystemPalette(palette());
  assert.ok(parsed);

  const light = dynamicRoles(parsed, 'light');
  assert.equal(light.hex['--primary'], BLUES[8]); // tone 40
  assert.equal(light.hex['--primary-foreground'], BLUES[0]); // tone 100
  assert.equal(light.hex['--primary-container'], BLUES[3]); // tone 90
  assert.equal(light.hex['--on-primary-container'], BLUES[11]); // tone 10

  const dark = dynamicRoles(parsed, 'dark');
  assert.equal(dark.hex['--primary'], BLUES[4]); // tone 80
  assert.equal(dark.hex['--primary-foreground'], BLUES[10]); // tone 20
  assert.equal(dark.hex['--primary-container'], BLUES[9]); // tone 30
});

test('the dark scheme keeps its background lighter than the rows on it', () => {
  const parsed = parseSystemPalette(palette());
  assert.ok(parsed);
  const { hex } = dynamicRoles(parsed, 'dark');
  const grey = (name: string) => parseInt(hex[name].slice(1, 3), 16);
  assert.ok(grey('--background') > grey('--surface-container-low'));
  assert.ok(grey('--surface-container-low') > grey('--surface-container-lowest'));
  assert.ok(grey('--surface-container-high') > grey('--surface-container'));
});

test('the light scheme tints the background and keeps the cards on it near-white', () => {
  const parsed = parseSystemPalette(palette());
  assert.ok(parsed);
  const { hex } = dynamicRoles(parsed, 'light');
  // accent2 is grey in this fixture, so lightness stands in for tone.
  const grey = (name: string) => parseInt(hex[name].slice(1, 3), 16);
  assert.ok(grey('--surface-container-low') > grey('--background'));
  assert.ok(grey('--card') > grey('--background'));
  assert.ok(grey('--surface-container-low') > grey('--surface-container-high'));

  // The background comes from the secondary palette, so it carries the wallpaper's hue.
  const tinted = palette();
  tinted.accent2 = [...BLUES];
  const tintedRoles = dynamicRoles(parseSystemPalette(tinted)!, 'light');
  assert.notEqual(tintedRoles.hex['--background'], hex['--background']);
  assert.equal(tintedRoles.hex['--surface-container-low'], hex['--surface-container-low']);
});

test('every role carries both a color and the matching CSS variable', () => {
  const parsed = parseSystemPalette(palette());
  assert.ok(parsed);
  const { hex, vars } = dynamicRoles(parsed, 'light');
  assert.deepEqual(Object.keys(vars), Object.keys(hex));
  for (const name of Object.keys(hex)) {
    assert.equal(vars[name], hexToHslTriplet(hex[name]));
    assert.match(vars[name], /^\d+(\.\d)? \d+(\.\d)?% \d+(\.\d)?%$/);
  }
});

test('roles are cached per palette, and an unchanged re-read keeps the palette', () => {
  const parsed = parseSystemPalette(palette());
  const again = parseSystemPalette(palette());
  assert.ok(parsed && again);
  assert.equal(dynamicRoles(parsed, 'dark'), dynamicRoles(parsed, 'dark'));
  assert.ok(samePalette(parsed, again));

  const changed = palette();
  changed.accent1[8] = '#123456';
  assert.equal(samePalette(parsed, parseSystemPalette(changed)), false);
  assert.equal(samePalette(parsed, null), false);
  assert.ok(samePalette(null, null));
});

test('hex converts to the HSL triplet global.css holds', () => {
  assert.equal(hexToHslTriplet('#ffffff'), '0 0% 100%');
  assert.equal(hexToHslTriplet('#000000'), '0 0% 0%');
  assert.equal(hexToHslTriplet('#ff0000'), '0 100% 50%');
  assert.equal(hexToHslTriplet('#1f8f82'), '173 64.4% 34.1%');
});

test('colour inspection retains RGB, unrounded HSL and Lab conversions', () => {
  assert.deepEqual(hexToRgb('#ff8000'), [255, 128, 0]);
  assert.deepEqual(hexToHsl('#ff0000'), [0, 100, 50]);
  assert.deepEqual(hexToHsl('#808080'), [0, 0, (128 / 255) * 100]);
  assert.ok(Math.abs(hexToLab('#ffffff')[0] - 100) < 0.01);
  assert.deepEqual(hexToLab('#000000'), [0, 0, 0]);
});
