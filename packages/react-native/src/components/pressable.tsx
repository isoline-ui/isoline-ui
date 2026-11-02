import * as React from 'react';
import {
  Platform,
  Pressable as RNPressable,
  StyleSheet,
  type PressableProps,
  type ViewStyle,
} from 'react-native';
import Animated, { type AnimatedProps } from 'react-native-reanimated';

import { useIsolinePlatform } from '../provider.tsx';
import { cn } from '../utils.ts';

/**
 * Shared touch feedback: contained ripples on Android, a pressed opacity on
 * iOS. Preserve the caller's style callback, handlers and animated styles.
 */
type PressableRef = React.ElementRef<typeof RNPressable>;
export const Pressable: React.ForwardRefExoticComponent<
  PressableProps & React.RefAttributes<PressableRef>
> = React.forwardRef<React.ElementRef<typeof RNPressable>, PressableProps>(function Pressable(
  { className, android_ripple, style, disabled, onKeyDown, accessibilityState, ...props },
  ref,
) {
  const ios = useIsolinePlatform() === 'ios';
  const web = Platform.OS === 'web';
  const classNames = cn(
    // Use browser modality detection, including keyboard use after a tap. Keep
    // the ring inside shaped/connected controls so clipping cannot cut it off.
    web &&
      'outline-0 focus-visible:[outline-style:solid] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-primary',
    Platform.OS === 'android' &&
      android_ripple &&
      !android_ripple.borderless &&
      'overflow-hidden',
    className,
  );
  return (
    <RNPressable
      ref={ref}
      disabled={disabled}
      onKeyDown={
        web
          ? (event) => {
              if (disabled) return;
              onKeyDown?.(event);
              const role = props.role ?? props.accessibilityRole;
              // RN Web's PressResponder only treats role=button as space-activatable.
              // Semantic toggles still need the standard Space behavior on the web.
              if (
                !event.defaultPrevented &&
                event.nativeEvent.key === ' ' &&
                role &&
                ['checkbox', 'switch', 'radio', 'menuitemradio', 'menuitemcheckbox'].includes(
                  role,
                )
              ) {
                event.preventDefault();
                const target = event.currentTarget as unknown as { click?: () => void };
                target.click?.();
              }
            }
          : onKeyDown
      }
      {...(web
        ? {
            'aria-busy': accessibilityState?.busy,
            'aria-checked': accessibilityState?.checked,
            'aria-disabled': disabled || accessibilityState?.disabled,
            'aria-expanded': accessibilityState?.expanded,
            'aria-selected': accessibilityState?.selected,
          }
        : { accessibilityState })}
      android_ripple={android_ripple}
      // NativeWind's web adapter cannot merge className into a style callback.
      // Supply RN Web's compiled-class marker inside the callback instead.
      className={web ? undefined : classNames}
      style={
        ios || Platform.OS === 'web'
          ? (state) => {
              const resolved = typeof style === 'function' ? style(state) : style;
              const opacity = StyleSheet.flatten(resolved)?.opacity;
              // Do not brighten translucent controls or replace animated opacity.
              const pressedOpacity =
                opacity === undefined || typeof opacity === 'number'
                  ? (opacity ?? 1) * 0.65
                  : undefined;
              return [
                web && classNames
                  ? ({ $$css: true, [classNames]: classNames } as ViewStyle)
                  : undefined,
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
