import { presetTokens } from './preset-tokens.ts';

export type ColorScheme = 'light' | 'dark';
export type TextVariant =
  | 'default'
  | 'display'
  | 'title'
  | 'heading'
  | 'subject'
  | 'body'
  | 'reader'
  | 'muted'
  | 'caption'
  | 'labelLarge'
  | 'label'
  | 'mono'
  | 'value'
  | 'valueLarge'
  | 'meta';

export interface TypographyRole {
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
  fontWeight?: '400' | '500' | '600' | '700' | '800';
  letterSpacing?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  includeFontPadding?: boolean;
}

export interface IsolineTheme {
  name: string;
  scheme: ColorScheme;
  /** HSL channel triplets, e.g. "268 75% 82%", matching the NativeWind preset. */
  tokens: Readonly<Record<string, string>>;
  typography?: Partial<Record<TextVariant, TypographyRole>>;
  sheetGesture?: 'handle' | 'panel';
}

export const ROLE_VARIABLES = {
  primary: '--primary',
  onPrimary: '--primary-foreground',
  primaryContainer: '--primary-container',
  onPrimaryContainer: '--on-primary-container',
  secondaryContainer: '--secondary-container',
  onSecondaryContainer: '--on-secondary-container',
  tertiary: '--tertiary',
  onTertiary: '--on-tertiary',
  tertiaryContainer: '--tertiary-container',
  onTertiaryContainer: '--on-tertiary-container',
  error: '--destructive',
  onError: '--destructive-foreground',
  errorContainer: '--error-container',
  onErrorContainer: '--on-error-container',
  surface: '--surface',
  onSurface: '--on-surface',
  surfaceVariant: '--surface-variant',
  onSurfaceVariant: '--on-surface-variant',
  surfaceContainerLowest: '--surface-container-lowest',
  surfaceContainerLow: '--surface-container-low',
  surfaceContainer: '--surface-container',
  surfaceContainerHigh: '--surface-container-high',
  surfaceContainerHighest: '--surface-container-highest',
  outline: '--outline',
  outlineVariant: '--outline-variant',
  inverseSurface: '--inverse-surface',
  inverseOnSurface: '--inverse-on-surface',
  inversePrimary: '--inverse-primary',
  success: '--success',
} as const;

export type ThemeColors = { -readonly [K in keyof typeof ROLE_VARIABLES]: string };
export interface RippleColors {
  onNeutral: string;
  onTonal: string;
}

export function resolveThemeColors(theme: IsolineTheme): ThemeColors {
  const result = {} as ThemeColors;
  for (const [role, variable] of Object.entries(ROLE_VARIABLES)) {
    const channels = theme.tokens[variable];
    if (!channels) throw new Error('Isoline UI: missing theme token ' + variable);
    result[role as keyof ThemeColors] = 'hsl(' + channels + ')';
  }
  return result;
}

export function rippleColors(scheme: ColorScheme): RippleColors {
  const light = 'rgba(255, 255, 255, 0.12)';
  const dark = 'rgba(0, 0, 0, 0.12)';
  return scheme === 'light'
    ? { onNeutral: dark, onTonal: light }
    : { onNeutral: light, onTonal: dark };
}

/** Creates a new theme without mutating the reusable preset. */
export function extendTheme(
  base: IsolineTheme,
  overrides: {
    name?: string;
    tokens?: Readonly<Record<string, string>>;
    typography?: IsolineTheme['typography'];
    sheetGesture?: IsolineTheme['sheetGesture'];
  },
): IsolineTheme {
  const typography = { ...base.typography };
  for (const [role, patch] of Object.entries(overrides.typography ?? {})) {
    const variant = role as TextVariant;
    typography[variant] = { ...typography[variant], ...patch };
  }
  return {
    ...base,
    name: overrides.name ?? base.name,
    tokens: { ...base.tokens, ...overrides.tokens },
    typography,
    sheetGesture: overrides.sheetGesture ?? base.sheetGesture,
  };
}

function preset(name: keyof typeof presetTokens, scheme: ColorScheme): IsolineTheme {
  // Fill optional roles absent from an older consumer palette, keeping a complete contract.
  const theme: IsolineTheme = {
    name,
    scheme,
    tokens: { ...presetTokens.violet[scheme], ...presetTokens[name][scheme] },
  };
  if (name === 'teal')
    theme.typography = {
      label: { textTransform: 'uppercase', fontWeight: '700', letterSpacing: 1.12 },
    };
  if (name === 'cyan') {
    theme.sheetGesture = 'panel';
    theme.typography = {
      display: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontWeight: '700',
        fontSize: 44,
        lineHeight: 48,
        letterSpacing: -1.32,
      },
      title: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontWeight: '700',
        lineHeight: 38,
        letterSpacing: -0.64,
      },
      heading: { fontFamily: 'SpaceGrotesk_700Bold', fontWeight: '700', letterSpacing: -0.22 },
      label: { letterSpacing: 0 },
      mono: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 13 },
      value: { fontFamily: 'JetBrainsMono_500Medium' },
      valueLarge: { fontFamily: 'JetBrainsMono_700Bold', letterSpacing: -0.22 },
    };
  }
  return theme;
}

const violet = { light: preset('violet', 'light'), dark: preset('violet', 'dark') };
const teal = { light: preset('teal', 'light'), dark: preset('teal', 'dark') };
const cyan = { light: preset('cyan', 'light'), dark: preset('cyan', 'dark') };

export const themes = {
  violet,
  teal,
  cyan,
} as const;

export const elevation = {
  level0: 0,
  level1: 1,
  level2: 3,
  level3: 6,
  level4: 8,
  level5: 12,
} as const;
