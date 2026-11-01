/**
 * Material You: the app's color roles, taken from the device's own palette.
 *
 * Android 12+ derives five tonal palettes from the wallpaper (or a theme the
 * user picked) — three accents and two neutrals — and every app that follows
 * the system, Gmail included, draws its roles from them. The native side
 * (`modules/expo-system-colors`) only hands the palettes over; this module
 * decides which tone of which palette plays each role, so the mapping can be
 * tested and changed over the air.
 *
 * Tones follow the Material 3 scheme for the accent roles. The surfaces take
 * their cue from Gmail in the light scheme: the screen behind everything is
 * tinted from the secondary palette, and the cards on it (thread rows,
 * settings groups) stay near-white, so the wallpaper shows in the space
 * around the content rather than in the content itself. Chips, fields and
 * button groups (`surface-container-high`) take a tinted fill so they still
 * read against a white card. The dark scheme keeps the app's own neutral
 * tones, including its deliberate inversion (the background sits lighter
 * than the containers on it, see `global.css`).
 *
 * Pure and free of `expo-*` imports so it runs under `node --test`.
 */

/** Tone of each stop in a palette as Android reports it: `_0` (white) through `_1000` (black). */
export const PALETTE_TONES = [100, 99, 95, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0] as const;

const PALETTE_KEYS = ['accent1', 'accent2', 'accent3', 'neutral1', 'neutral2'] as const;

type PaletteKey = (typeof PALETTE_KEYS)[number];

/** The device's tonal palettes, each a `#rrggbb` per stop in `PALETTE_TONES` order. */
export type SystemPalette = Readonly<Record<PaletteKey, readonly string[]>>;

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/**
 * Narrows what the native module returned to a usable palette, or `null`.
 *
 * Anything short of five complete palettes of valid colors is refused whole
 * rather than patched: a half-read palette would paint some roles from the
 * wallpaper and leave others unset.
 */
export function parseSystemPalette(value: unknown): SystemPalette | null {
  if (typeof value !== 'object' || value === null) return null;
  const palette: Partial<Record<PaletteKey, readonly string[]>> = {};
  for (const key of PALETTE_KEYS) {
    const tones: unknown = Reflect.get(value, key);
    if (!Array.isArray(tones) || tones.length !== PALETTE_TONES.length) return null;
    const colors: string[] = [];
    for (const tone of tones) {
      if (typeof tone !== 'string' || !HEX_COLOR.test(tone)) return null;
      colors.push(tone.toLowerCase());
    }
    palette[key] = colors;
  }
  const { accent1, accent2, accent3, neutral1, neutral2 } = palette;
  if (!accent1 || !accent2 || !accent3 || !neutral1 || !neutral2) return null;
  return { accent1, accent2, accent3, neutral1, neutral2 };
}

/** Whether two palettes hold the same colors, so a re-read that changed nothing re-renders nothing. */
export function samePalette(a: SystemPalette | null, b: SystemPalette | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return PALETTE_KEYS.every((key) => a[key].every((color, index) => color === b[key][index]));
}

type Role = readonly [palette: PaletteKey, light: number, dark: number];

/**
 * Every CSS variable `global.css` defines that the accent tints, plus the
 * tertiary roles (which keep a fixed indigo under the presets but follow the
 * wallpaper's third accent here, as they do in the system apps). Error and
 * the triage colors stay fixed: they carry meaning, not decoration.
 */
const ROLES: Record<string, Role> = {
  '--background': ['accent2', 94, 11],
  '--foreground': ['neutral1', 10, 90],
  '--surface': ['accent2', 94, 11],
  '--surface-variant': ['neutral2', 90, 25],
  '--on-surface': ['neutral1', 10, 90],
  '--on-surface-variant': ['neutral2', 30, 80],
  '--surface-container-lowest': ['neutral1', 100, 6],
  '--surface-container-low': ['neutral1', 99, 8],
  '--surface-container': ['neutral1', 97, 13],
  '--surface-container-high': ['accent2', 90, 17],
  '--surface-container-highest': ['accent2', 87, 22],
  '--card': ['neutral1', 99, 13],
  '--card-foreground': ['neutral1', 10, 90],
  '--popover': ['neutral1', 97, 17],
  '--popover-foreground': ['neutral1', 10, 90],
  '--primary': ['accent1', 40, 80],
  '--primary-foreground': ['accent1', 100, 20],
  '--primary-container': ['accent1', 90, 30],
  '--on-primary-container': ['accent1', 10, 90],
  '--secondary-container': ['accent2', 90, 30],
  '--on-secondary-container': ['accent2', 10, 90],
  '--tertiary': ['accent3', 40, 80],
  '--on-tertiary': ['accent3', 100, 20],
  '--tertiary-container': ['accent3', 90, 30],
  '--on-tertiary-container': ['accent3', 10, 90],
  '--muted': ['neutral2', 90, 25],
  '--muted-foreground': ['neutral2', 30, 80],
  '--accent': ['accent2', 90, 22],
  '--accent-foreground': ['accent1', 10, 90],
  '--outline': ['neutral2', 50, 60],
  '--outline-variant': ['neutral2', 80, 30],
  '--border': ['neutral2', 80, 22],
  '--input': ['neutral2', 55, 45],
  '--ring': ['accent1', 40, 80],
  '--inverse-surface': ['neutral1', 20, 90],
  '--inverse-on-surface': ['neutral1', 95, 20],
  '--inverse-primary': ['accent1', 80, 40],
};

/** One scheme's roles, both as `#rrggbb` and as the `H S% L%` triplet `global.css` variables hold. */
export interface DynamicRoles {
  hex: Readonly<Record<string, string>>;
  vars: Readonly<Record<string, string>>;
}

const cache = new WeakMap<SystemPalette, { light?: DynamicRoles; dark?: DynamicRoles }>();

/**
 * The role colors for one scheme. Cached per palette object: this runs on
 * every render of every component that reads a theme color, and the palette
 * only changes when the wallpaper does.
 */
export function dynamicRoles(palette: SystemPalette, scheme: 'light' | 'dark'): DynamicRoles {
  const entry = cache.get(palette) ?? {};
  const cached = entry[scheme];
  if (cached) return cached;

  const hex: Record<string, string> = {};
  const vars: Record<string, string> = {};
  for (const [name, [key, light, dark]] of Object.entries(ROLES)) {
    const color = paletteTone(palette[key], scheme === 'light' ? light : dark);
    hex[name] = color;
    vars[name] = hexToHslTriplet(color);
  }
  const roles = { hex, vars };
  entry[scheme] = roles;
  cache.set(palette, entry);
  return roles;
}

/**
 * A palette's color at any tone, `#rrggbb`.
 *
 * Android reports thirteen stops, and several roles sit between them
 * (the light background at 94, the dark one at 11). Material
 * tone is CIE L*, so a tone between two stops is found by interpolating in
 * CIELAB: L* lands exactly on the tone asked for, and chroma eases between
 * the neighbours' — fading out toward black and white as it should.
 */
export function paletteTone(stops: readonly string[], tone: number): string {
  const target = Math.min(100, Math.max(0, tone));
  for (let index = 0; index < PALETTE_TONES.length - 1; index++) {
    const upper = PALETTE_TONES[index];
    const lower = PALETTE_TONES[index + 1];
    if (target > upper || target < lower) continue;
    if (target === upper) return stops[index];
    if (target === lower) return stops[index + 1];
    const t = (upper - target) / (upper - lower);
    const from = hexToLab(stops[index]);
    const to = hexToLab(stops[index + 1]);
    return labToHex([target, from[1] + (to[1] - from[1]) * t, from[2] + (to[2] - from[2]) * t]);
  }
  return stops[stops.length - 1];
}

export type Rgb = [number, number, number];
export type Lab = [number, number, number];

export function hexToRgb(hex: string): Rgb {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

function rgbToHex([r, g, b]: Rgb): string {
  const channel = (value: number) =>
    Math.round(Math.min(255, Math.max(0, value)))
      .toString(16)
      .padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

// sRGB (D65) <-> CIELAB.
const WHITE: Rgb = [95.047, 100, 108.883];

function toLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function fromLinear(value: number): number {
  const c = value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055;
  return c * 255;
}

function labF(t: number): number {
  return t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116;
}

function labFInverse(t: number): number {
  return t ** 3 > 216 / 24389 ? t ** 3 : (116 * t - 16) / (24389 / 27);
}

export function hexToLab(hex: string): Lab {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) * 100;
  const y = (0.2126 * r + 0.7152 * g + 0.0722 * b) * 100;
  const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) * 100;
  const fx = labF(x / WHITE[0]);
  const fy = labF(y / WHITE[1]);
  const fz = labF(z / WHITE[2]);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function labToHex([l, a, b]: Lab): string {
  const fy = (l + 16) / 116;
  const x = labFInverse(fy + a / 500) * WHITE[0];
  const y = labFInverse(fy) * WHITE[1];
  const z = labFInverse(fy - b / 200) * WHITE[2];
  const [xn, yn, zn] = [x / 100, y / 100, z / 100];
  return rgbToHex([
    fromLinear(3.2406 * xn - 1.5372 * yn - 0.4986 * zn),
    fromLinear(-0.9689 * xn + 1.8758 * yn + 0.0415 * zn),
    fromLinear(0.0557 * xn - 0.204 * yn + 1.057 * zn),
  ]);
}

/** `#rrggbb` to the `H S% L%` triplet a `global.css` variable holds, one decimal place each. */
export function hexToHslTriplet(hex: string): string {
  const round = (value: number) => Math.round(value * 10) / 10;
  const [hue, saturation, lightness] = hexToHsl(hex);
  return `${round(hue)} ${round(saturation)}% ${round(lightness)}%`;
}

/** `#rrggbb` to hue in degrees, saturation and lightness in percent, unrounded. */
export function hexToHsl(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex).map((channel) => channel / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const delta = max - min;
  let hue = 0;
  let saturation = 0;
  if (delta > 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  return [hue, saturation * 100, lightness * 100];
}
