import * as React from 'react';
import { View, type ViewStyle } from 'react-native';
import { useThemeColors, useIsolineTheme } from '@isoline-ui/react-native';
import type { MaterialSurfaceProps } from './material-types.ts';
export type { MaterialSurfaceProps } from './material-types.ts';

/** CSS approximation only: browsers cannot render Apple's native Liquid Glass. */
export function MaterialSurface({
  material = 'auto',
  fallbackColor,
  tintColor,
  glassStyle = 'regular',
  interactive,
  style,
  ...props
}: MaterialSurfaceProps) {
  const colors = useThemeColors();
  const { scheme } = useIsolineTheme();
  const [supported, setSupported] = React.useState(false);
  React.useEffect(() => {
    const transparency = window.matchMedia('(prefers-reduced-transparency: reduce)');
    const contrast = window.matchMedia('(forced-colors: active)');
    const update = () =>
      setSupported(
        !transparency.matches &&
          !contrast.matches &&
          typeof CSS !== 'undefined' &&
          (CSS.supports('backdrop-filter', 'blur(1px)') ||
            CSS.supports('-webkit-backdrop-filter', 'blur(1px)')),
      );
    update();
    transparency.addEventListener('change', update);
    contrast.addEventListener('change', update);
    return () => {
      transparency.removeEventListener('change', update);
      contrast.removeEventListener('change', update);
    };
  }, []);
  const glass = material !== 'solid' && supported;
  const glassStyleWeb = {
    backgroundColor:
      tintColor ??
      (scheme === 'dark'
        ? `rgba(28,28,32,${glassStyle === 'clear' ? 0.35 : 0.72})`
        : `rgba(255,255,255,${glassStyle === 'clear' ? 0.35 : 0.72})`),
    backdropFilter: 'blur(24px) saturate(160%)',
    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
    borderWidth: 1,
    borderColor: scheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.65)',
    boxShadow: '0px 4px 20px rgba(0,0,0,0.12)',
  } as ViewStyle;
  return (
    <View
      {...props}
      style={[
        { backgroundColor: fallbackColor ?? colors.surfaceContainer },
        glass && glassStyleWeb,
        style,
      ]}
    />
  );
}
