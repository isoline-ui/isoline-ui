import * as React from 'react';
import { View, type ViewProps, type DimensionValue } from 'react-native';
import { useThemeColors } from '../provider.tsx';

export interface SkeletonProps extends ViewProps {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
}
/** A static placeholder: respects reduced motion without adding an infinite animation. */
export function Skeleton({
  width = '100%',
  height = 16,
  radius = 8,
  style,
  ...props
}: SkeletonProps) {
  const colors = useThemeColors();
  return (
    <View
      {...props}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: colors.surfaceContainerHighest,
        },
        style,
      ]}
    />
  );
}
