import * as React from 'react';
import { AppState, Appearance } from 'react-native';
import type { IsolineTheme } from '@isoline-ui/react-native/theme';
import { getSystemPalette } from './system-colors.ts';
import { samePalette, type SystemPalette } from './dynamic-color.ts';
import { applySystemPalette } from './theme.ts';

/** Refreshes when returning from wallpaper settings or changing system appearance. */
export function useSystemPalette(enabled = true): SystemPalette | null {
  const [palette, setPalette] = React.useState<SystemPalette | null>(() =>
    enabled ? getSystemPalette() : null,
  );
  React.useEffect(() => {
    if (!enabled) {
      setPalette(null);
      return;
    }
    const refresh = () => {
      const next = getSystemPalette();
      setPalette((previous) => (samePalette(previous, next) ? previous : next));
    };
    refresh();
    const app = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    const appearance = Appearance.addChangeListener(refresh);
    return () => {
      app.remove();
      appearance.remove();
    };
  }, [enabled]);
  return enabled ? palette : null;
}

export function useSystemTheme(base: IsolineTheme, enabled = true): IsolineTheme {
  const palette = useSystemPalette(enabled);
  return React.useMemo(() => applySystemPalette(base, palette), [base, palette]);
}
