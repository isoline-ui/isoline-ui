import type { PressableStateCallbackType } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Platform, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Surface, type MaterialOptions } from '../provider.tsx';
import { usesPlatformMaterial } from '../material.ts';
import { iosButtonAppearance, iosButtonMetrics } from '../ios-controls.ts';
import { DialogActionContext } from './dialog-context.ts';
import type { IconProps } from './icons.tsx';
import { AnimatedPressable, Pressable } from './pressable.tsx';
import { Text } from './text.tsx';
import { useIsolinePlatform, useHaptics } from '../provider.tsx';
import { spatial } from '../motion.ts';
import { corner } from '../shape.ts';
import {
  useRipple,
  useThemeColors,
  type RippleColors,
  type ThemeColors,
} from '../provider.tsx';
import { cn } from '../utils.ts';

/**
 * Material 3 Expressive button.
 *
 * Colour still carries emphasis — Filled for the one action that matters,
 * Tonal below it, Outlined and Text lower again — but Expressive added two
 * dimensions on top of that:
 *
 * - **Size as hierarchy.** Five sizes from XS to XL, so a primary action can
 *   be made important by being *large*, not just by being coloured. The larger
 *   sizes are meant to be used; a screen where every button is medium is the
 *   thing this is trying to fix.
 * - **Shape as feedback.** Every button morphs between round and square while
 *   pressed. The shape change is felt more than it is seen, and it survives on
 *   a filled button where a ripple over a saturated fill barely registers.
 */

const buttonVariants = cva('flex-row items-center justify-center', {
  variants: {
    variant: {
      default: 'bg-primary',
      secondary: 'bg-secondaryContainer',
      tonal: 'bg-primaryContainer',
      tertiary: 'bg-tertiary',
      outline: 'border border-outline bg-transparent',
      ghost: 'bg-transparent',
      destructive: 'bg-destructive',
    },
    size: {
      xs: 'h-8 gap-1.5 px-3',
      s: 'h-10 gap-2 px-4',
      m: 'h-14 gap-2 px-6',
      l: 'h-24 gap-3 px-12',
      xl: 'h-[136px] gap-4 px-16',
      icon: 'h-12 w-12 px-0',
    },
  },
  defaultVariants: { variant: 'default', size: 'm' },
});

const labelVariants = cva('font-semibold', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      secondary: 'text-onSecondaryContainer',
      tonal: 'text-onPrimaryContainer',
      tertiary: 'text-tertiary-foreground',
      outline: 'text-foreground',
      ghost: 'text-primary',
      destructive: 'text-destructive-foreground',
    },
    size: {
      xs: 'text-[13px]',
      s: 'text-sm',
      m: 'text-[15px]',
      l: 'text-2xl',
      xl: 'text-[32px]',
      icon: 'text-[15px]',
    },
  },
  defaultVariants: { variant: 'default', size: 'm' },
});

/** Ripple reads dark-on-light for filled/tonal fills, light-on-dark otherwise. */
function rippleByVariant(
  ripple: RippleColors,
): Record<NonNullable<ButtonProps['variant']>, string> {
  return {
    default: ripple.onTonal,
    secondary: ripple.onTonal,
    tonal: ripple.onTonal,
    tertiary: ripple.onTonal,
    outline: ripple.onNeutral,
    ghost: ripple.onNeutral,
    destructive: ripple.onTonal,
  };
}

/** The icon beside a label takes the label's color. */
function iconColor(colors: ThemeColors, variant: NonNullable<ButtonProps['variant']>): string {
  const byVariant: Record<NonNullable<ButtonProps['variant']>, string> = {
    default: colors.onPrimary,
    secondary: colors.onSecondaryContainer,
    tonal: colors.onPrimaryContainer,
    tertiary: colors.onTertiary,
    outline: colors.onSurface,
    ghost: colors.primary,
    destructive: colors.onError,
  };
  return byVariant[variant];
}

const ICON_SIZE: Record<NonNullable<ButtonProps['size']>, number> = {
  xs: 16,
  s: 18,
  m: 20,
  l: 32,
  xl: 40,
  icon: 20,
};

/** Height and the M3 square-shape radius for each size, in dp. */
const METRICS: Record<NonNullable<ButtonProps['size']>, { height: number; square: number }> = {
  xs: { height: 32, square: corner.medium },
  s: { height: 40, square: corner.medium },
  m: { height: 56, square: corner.large },
  l: { height: 96, square: corner.extraLarge },
  xl: { height: 136, square: corner.extraLarge },
  icon: { height: 48, square: corner.medium },
};

export type ButtonProps = Omit<React.ComponentProps<typeof Pressable>, 'children'> &
  VariantProps<typeof buttonVariants> &
  MaterialOptions & {
    children?: React.ComponentProps<typeof Pressable>['children'];
    pressableClassName?: string;
    label?: string;
    /** A leading symbol, drawn in the label's color. */
    icon?: React.ComponentType<IconProps>;
    /** Resting shape. Pressing morphs to the other one and back. */
    shape?: 'round' | 'square';
    /** Fires a selection tick on press. Off for destructive-adjacent actions. */
    haptic?: boolean;
  };

/**
 * Pressable with a spring shape-and-scale morph on touch.
 *
 * The press feedback runs on the UI thread through Reanimated rather than
 * through React state, so it stays at 60fps while the JS thread is busy
 * ingesting a sync batch.
 */
export function Button({
  className,
  material = 'solid',
  glassStyle,
  tintColor,
  fallbackColor,
  interactive = true,
  pressableClassName,
  style,
  variant,
  size,
  label,
  icon: Icon,
  shape = 'round',
  haptic = true,
  children,
  onPressIn,
  onPressOut,
  onPress,
  ...props
}: ButtonProps) {
  const web = Platform.OS === 'web';
  const platform = useIsolinePlatform();
  const ios = platform === 'ios';
  const materialActive = usesPlatformMaterial(platform, material);
  const Container = (
    materialActive ? Surface : web || ios ? View : Animated.View
  ) as typeof Animated.View;
  const Control = (
    web || ios || materialActive ? Pressable : AnimatedPressable
  ) as typeof AnimatedPressable;
  // Reanimated only drives the animated styles it finds in a plain `style`
  // value: inside a style callback they are dropped, and the control keeps
  // square corners under its rounded clip (an Outlined border then shows only
  // as broken top and bottom lines). So the animated control gets a resolved
  // array, and a caller's style callback is fed the pressed state from here.
  const animated = !web && !ios && !materialActive;
  const tracksPressed = web || (animated && typeof style === 'function');
  const [pressedNow, setPressedNow] = React.useState(false);
  const alertAction = React.useContext(DialogActionContext) && ios;
  const { selectionHaptic } = useHaptics();
  const ripple = useRipple();
  const colors = useThemeColors();
  const pressed = useSharedValue(0);
  const resolvedVariant = variant ?? 'default';
  const resolvedSize = size ?? 'm';
  const iosMetrics = iosButtonMetrics[resolvedSize];
  const iosHeight = iosMetrics.height;
  const iosLook = iosButtonAppearance(colors)[resolvedVariant];
  const ink =
    alertAction || materialActive
      ? resolvedVariant === 'destructive'
        ? colors.error
        : colors.primary
      : ios
        ? iosLook.ink
        : iconColor(colors, resolvedVariant);
  const metrics = ios ? { ...METRICS[resolvedSize], height: iosHeight } : METRICS[resolvedSize];

  const rest = ios
    ? metrics.height / 2
    : shape === 'round'
      ? metrics.height / 2
      : metrics.square;
  const active = ios ? rest : shape === 'round' ? metrics.square : metrics.height / 2;

  // Radius is shared with the wrapper below so the ripple's own clip morphs
  // in lockstep with the visible shape — a Pressable can only self-clip its
  // ripple to whatever radius it has *right now*, and Android's ripple mask
  // doesn't reliably keep up with per-frame Reanimated updates on its own.
  const radiusStyle = useAnimatedStyle(() => ({
    borderRadius: rest + (active - rest) * pressed.value,
  }));
  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.03 }],
  }));

  return (
    <Container
      {...(materialActive
        ? { material, glassStyle, tintColor, fallbackColor, interactive }
        : {})}
      style={[
        web || ios || materialActive
          ? {
              borderRadius: alertAction
                ? 0
                : materialActive
                  ? rest
                  : pressedNow
                    ? active
                    : rest,
            }
          : radiusStyle,
        ios && props.disabled && { opacity: 0.4 },
        alertAction && { flex: 1, borderRadius: 0 },
      ]}
      className={cn(!materialActive && 'overflow-hidden', className)}
    >
      <Control
        className={cn(
          buttonVariants({ variant, size }),
          !ios && props.disabled && 'opacity-50',
          pressableClassName,
        )}
        style={resolveStyle(animated, pressedNow, (state: PressableStateCallbackType) => [
          web || ios || materialActive
            ? {
                borderRadius: pressedNow ? active : rest,
                transform: ios ? undefined : [{ scale: pressedNow ? 0.97 : 1 }],
              }
            : radiusStyle,
          animated && scaleStyle,
          ios && {
            minHeight: iosHeight,
            height: 'auto',
            paddingHorizontal: iosMetrics.padding,
            gap: resolvedSize === 'xs' ? 5 : 7,
            backgroundColor: iosLook.fill,
            width: resolvedSize === 'icon' ? iosHeight : undefined,
            borderWidth: resolvedVariant === 'outline' ? 0 : undefined,
          },
          materialActive && { backgroundColor: 'transparent', borderWidth: 0 },
          alertAction && { backgroundColor: 'transparent', borderWidth: 0, borderRadius: 0 },
          typeof style === 'function' ? style(state) : style,
        ])}
        android_ripple={{ color: rippleByVariant(ripple)[resolvedVariant] }}
        onPressIn={(event) => {
          if (tracksPressed) setPressedNow(true);
          if (!ios) pressed.value = withSpring(1, spatial.fast);
          onPressIn?.(event);
        }}
        onPressOut={(event) => {
          if (tracksPressed) setPressedNow(false);
          if (!ios) pressed.value = withSpring(0, spatial.default);
          onPressOut?.(event);
        }}
        onPress={(event) => {
          if (haptic) selectionHaptic();
          onPress?.(event);
        }}
        accessibilityRole="button"
        accessibilityState={{ disabled: props.disabled ?? false }}
        {...props}
      >
        {(state: PressableStateCallbackType) => (
          <>
            {Icon ? (
              <Icon size={ios ? iosMetrics.icon : ICON_SIZE[resolvedSize]} color={ink} />
            ) : null}
            {label ? (
              <Text
                className={cn(labelVariants({ variant, size }))}
                style={[
                  ios && {
                    fontSize: iosMetrics.label,
                    lineHeight: iosMetrics.label + 5,
                    fontWeight: '600',
                  },
                  (ios || alertAction || materialActive) && { color: ink },
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            ) : typeof children === 'function' ? (
              children(state)
            ) : (
              children
            )}
          </>
        )}
      </Control>
    </Container>
  );
}

/**
 * The control's style as Reanimated can read it: resolved now for the
 * animated control, left as a callback where no animated style is involved.
 */
function resolveStyle<T>(
  animated: boolean,
  pressed: boolean,
  style: (state: PressableStateCallbackType) => T,
): T | ((state: PressableStateCallbackType) => T) {
  return animated ? style({ pressed }) : style;
}

export { buttonVariants, labelVariants };
