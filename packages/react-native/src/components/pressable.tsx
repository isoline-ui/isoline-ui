import * as React from 'react';
import {
  Platform,
  Pressable as RNPressable,
  StyleSheet,
  type PressableProps,
} from 'react-native';
import Animated, { type AnimatedProps } from 'react-native-reanimated';

import { cn } from '../utils.ts';

/**
 * Shared touch feedback: contained ripples on Android, a pressed opacity on
 * iOS. Preserve the caller's style callback, handlers and animated styles.
 */
type PressableRef = React.ElementRef<typeof RNPressable>;
export const Pressable: React.ForwardRefExoticComponent<
  PressableProps & React.RefAttributes<PressableRef>
> = React.forwardRef<React.ElementRef<typeof RNPressable>, PressableProps>(function Pressable(
  { className, android_ripple, style, disabled, ...props },
  ref,
) {
  return (
    <RNPressable
      ref={ref}
      disabled={disabled}
      android_ripple={android_ripple}
      className={cn(
        Platform.OS === 'android' &&
          android_ripple &&
          !android_ripple.borderless &&
          'overflow-hidden',
        className,
      )}
      style={
        Platform.OS === 'ios'
          ? (state) => {
              const resolved = typeof style === 'function' ? style(state) : style;
              const opacity = StyleSheet.flatten(resolved)?.opacity;
              // Do not brighten translucent controls or replace animated opacity.
              const pressedOpacity =
                opacity === undefined || typeof opacity === 'number'
                  ? (opacity ?? 1) * 0.65
                  : undefined;
              return [
                resolved,
                state.pressed && !disabled && pressedOpacity !== undefined
                  ? { opacity: pressedOpacity }
                  : undefined,
              ];
            }
          : style
      }
      {...props}
    />
  );
});

/** For a Pressable whose shape or radius is driven by a Reanimated style. */
export const AnimatedPressable: React.ComponentType<
  Omit<AnimatedProps<PressableProps>, 'ref'> & React.RefAttributes<PressableRef>
> = Animated.createAnimatedComponent(Pressable);
