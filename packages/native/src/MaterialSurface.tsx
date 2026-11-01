import * as React from 'react';
import { View } from 'react-native';
import { useThemeColors } from '@isoline-ui/react-native';
import type { MaterialSurfaceProps } from './material-types.ts';
export type { MaterialSurfaceProps } from './material-types.ts';

export function MaterialSurface({
  material,
  fallbackColor,
  tintColor,
  glassStyle,
  interactive,
  style,
  ...props
}: MaterialSurfaceProps) {
  const colors = useThemeColors();
  return (
    <View
      {...props}
      style={[{ backgroundColor: fallbackColor ?? colors.surfaceContainer }, style]}
    />
  );
}
