import type { IsolineTheme } from '@isoline-ui/react-native/theme';
import { dynamicRoles, type SystemPalette } from './dynamic-color.ts';

/** Keeps brand typography and semantic error/success colors. */
export function applySystemPalette(
  base: IsolineTheme,
  palette: SystemPalette | null,
): IsolineTheme {
  if (!palette) return base;
  return {
    ...base,
    name: `${base.name}-system`,
    tokens: { ...base.tokens, ...dynamicRoles(palette, base.scheme).vars },
  };
}
