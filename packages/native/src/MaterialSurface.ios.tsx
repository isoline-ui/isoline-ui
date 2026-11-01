import * as React from 'react';
import { AccessibilityInfo, View } from 'react-native';
import {
  GlassView,
  isLiquidGlassAvailable,
  isGlassEffectAPIAvailable,
} from 'expo-glass-effect';
import { useThemeColors, useIsolineTheme } from '@isoline-ui/react-native';
import type { MaterialSurfaceProps } from './material-types.ts';
export type { MaterialSurfaceProps } from './material-types.ts';

export function MaterialSurface({
  material = 'auto',
  fallbackColor,
  tintColor,
  glassStyle = 'regular',
  interactive = false,
  style,
  ...props
}: MaterialSurfaceProps) {
  const colors = useThemeColors();
  const { scheme } = useIsolineTheme();
  // Fail closed until the accessibility setting is known.
  const [reduceTransparency, setReduceTransparency] = React.useState(true);
  React.useEffect(() => {
    let active = true;
    const subscription = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      (value) => {
        active = false; // A newer event wins over an in-flight initial read.
        setReduceTransparency(value);
      },
    );
    void AccessibilityInfo.isReduceTransparencyEnabled().then(
      (value) => {
        if (active) setReduceTransparency(value);
      },
      () => {},
    );
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  const supported = isGlassEffectAPIAvailable() && isLiquidGlassAvailable();
  if (material === 'solid' || reduceTransparency || !supported) {
    return (
      <View
        {...props}
        style={[{ backgroundColor: fallbackColor ?? colors.surfaceContainer }, style]}
      />
    );
  }
  return (
    <GlassView
      {...props}
      style={style}
      glassEffectStyle={glassStyle}
      tintColor={tintColor}
      isInteractive={interactive}
      colorScheme={scheme}
    />
  );
}
