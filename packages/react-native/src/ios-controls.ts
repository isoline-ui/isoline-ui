import type { ThemeColors } from './theme.ts';

/** iOS geometry shared by control rendering, including accessible touch heights. */
export const iosButtonMetrics = {
  xs: { height: 44, padding: 12, label: 13, icon: 15 },
  s: { height: 44, padding: 14, label: 15, icon: 17 },
  m: { height: 50, padding: 20, label: 17, icon: 19 },
  l: { height: 64, padding: 28, label: 20, icon: 24 },
  xl: { height: 80, padding: 32, label: 24, icon: 28 },
  icon: { height: 44, padding: 0, label: 15, icon: 20 },
} as const;

/** Semantic emphasis uses the supplied theme, without owning a product palette. */
export function iosButtonAppearance(colors: ThemeColors) {
  return {
    default: { fill: colors.primary, ink: colors.onPrimary },
    secondary: { fill: colors.secondaryContainer, ink: colors.primary },
    tonal: { fill: colors.primaryContainer, ink: colors.onPrimaryContainer },
    tertiary: { fill: colors.tertiary, ink: colors.onTertiary },
    outline: { fill: colors.secondaryContainer, ink: colors.onSurface },
    ghost: { fill: 'transparent', ink: colors.primary },
    destructive: { fill: colors.secondaryContainer, ink: colors.error },
  };
}
