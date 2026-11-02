import * as React from 'react';
import { View } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { useNativeGlassAvailable } from './glass-support.ios.ts';
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
  const supported = useNativeGlassAvailable();
  if (material === 'solid' || !supported) {
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
