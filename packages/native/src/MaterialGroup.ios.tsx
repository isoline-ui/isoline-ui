import * as React from 'react';
import { View } from 'react-native';
import { GlassContainer } from 'expo-glass-effect';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { spatial, useReducedMotion } from '@isoline-ui/react-native';
import { useNativeGlassAvailable } from './glass-support.ios.ts';
import type { MaterialGroupProps } from './material-types.ts';
const AnimatedContainer = Animated.createAnimatedComponent(GlassContainer);
/** Native merging follows the smoothly changing layout, with a reduced-motion path. */
export function MaterialGroup({
  spacing,
  gap = 0,
  animate = true,
  style,
  ...props
}: MaterialGroupProps) {
  const supported = useNativeGlassAvailable();
  const reduced = useReducedMotion();
  const current = useSharedValue(gap);
  React.useEffect(() => {
    current.value = animate && !reduced ? withSpring(gap, spatial.default) : gap;
  }, [gap, animate, reduced, current]);
  const layout = useAnimatedStyle(() => ({ gap: current.value }));
  return supported ? (
    <AnimatedContainer spacing={spacing} {...props} style={[layout, style]} />
  ) : (
    <View {...props} style={[{ gap }, style]} />
  );
}
