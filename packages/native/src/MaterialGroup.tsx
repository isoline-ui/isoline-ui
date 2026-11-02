import * as React from 'react';
import { Platform, View, type ViewStyle } from 'react-native';
import { useReducedMotion } from '@isoline-ui/react-native';
import type { MaterialGroupProps } from './material-types.ts';
/** Web animates layout only. It does not imitate native merging/refraction. */
export function MaterialGroup({
  spacing,
  gap,
  animate = true,
  style,
  ...props
}: MaterialGroupProps) {
  const reduced = useReducedMotion();
  const motion =
    Platform.OS === 'web'
      ? ({
          transitionProperty: 'gap',
          transitionDuration: animate && !reduced ? '180ms' : '0ms',
        } as ViewStyle)
      : undefined;
  return <View {...props} style={[gap !== undefined && { gap }, motion, style]} />;
}
