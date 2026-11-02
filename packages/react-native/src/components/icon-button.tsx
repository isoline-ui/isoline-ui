import * as React from 'react';
import {
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Surface, type MaterialOptions } from '../provider.tsx';
import { usesPlatformMaterial } from '../material.ts';
import { Pressable } from './pressable.tsx';
import { spatial } from '../motion.ts';
import { useIsolinePlatform, useRipple, useThemeColors } from '../provider.tsx';
import { cn } from '../utils.ts';

export interface IconButtonProps extends MaterialOptions {
  icon: React.ComponentType<{ size?: number; color?: string; fill?: string }>;
  /**
   * Receives the press event, for a button nested inside a pressable row that
   * has to stop the row from seeing the same tap.
   */
  onPress: (event: GestureResponderEvent) => void;
  /** Touch target diameter in dp; also sets the ripple's radius. */
  size?: number;
  iconSize?: number;
  /** Defaults to `onSurfaceVariant`. */
  color?: string;
  fill?: string;
  accessibilityLabel?: string;
  hitSlop?: PressableProps['hitSlop'];
  className?: string;
  /** For a filled/elevated variant — plain RN styles, since `elevation` can't be a class. */
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

/**
 * The one size every icon button in a screen's header uses: a full 48dp
 * target around a 22dp glyph, so a back arrow, a star and a sync toggle read
 * as the same kind of control from one screen to the next. Spread it in —
 * `<IconButton {...HEADER_ICON_BUTTON} … />` — rather than repeating the
 * numbers, which is how they drifted apart before.
 */
export const HEADER_ICON_BUTTON = { size: 48, iconSize: 22 } as const;

/** A circular icon-only pressable with the app's standard borderless ripple. */
export function IconButton({
  icon: Icon,
  onPress,
  size = 40,
  iconSize = 18,
  color,
  fill,
  accessibilityLabel,
  hitSlop = 8,
  className,
  style,
  disabled,
  material = 'solid',
  glassStyle,
  tintColor,
  fallbackColor,
  interactive = true,
}: IconButtonProps) {
  const platform = useIsolinePlatform();
  const ios = platform === 'ios';
  const materialActive = usesPlatformMaterial(platform, material);
  const extent = materialActive ? Math.max(size, 44) : size;
  const colors = useThemeColors();
  const ripple = useRipple();
  // The symbol gives a little under the finger, as the ripple spreads round it.
  const pressed = useSharedValue(0);
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.14 }],
  }));

  const control = (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        pressed.value = withSpring(1, spatial.fast);
      }}
      onPressOut={() => {
        pressed.value = withSpring(0, spatial.default);
      }}
      hitSlop={hitSlop}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      android_ripple={{ color: ripple.onNeutral, borderless: true, radius: size / 2 }}
      className={cn(
        'items-center justify-center rounded-full',
        disabled && 'opacity-50',
        className,
      )}
      style={[{ width: extent, height: extent }, !materialActive && style]}
    >
      <Animated.View style={iconStyle}>
        <Icon
          size={iconSize}
          color={color ?? (ios ? colors.primary : colors.onSurfaceVariant)}
          {...(fill ? { fill } : null)}
        />
      </Animated.View>
    </Pressable>
  );
  return materialActive ? (
    <Surface
      material={material}
      glassStyle={glassStyle}
      tintColor={tintColor}
      fallbackColor={fallbackColor}
      interactive={interactive}
      style={[{ borderRadius: extent / 2 }, style]}
    >
      {control}
    </Surface>
  ) : (
    control
  );
}
