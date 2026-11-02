import * as React from 'react';
import {
  View,
  type ViewProps,
  type ViewStyle,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, {
  type AnimatedStyle,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import type { IconProps } from './icons.tsx';
import { Pressable } from './pressable.tsx';
import { Text } from './text.tsx';
import { Platform } from 'react-native';
import { Surface, type MaterialOptions, useIsolinePlatform, useHaptics } from '../provider.tsx';
import { useReducedMotion } from '../reduced-motion.ts';
import { spatial } from '../motion.ts';
import { elevation, useRipple, useThemeColors } from '../provider.tsx';
import { cn } from '../utils.ts';

/**
 * Material 3 Expressive floating toolbar.
 *
 * Expressive replaced the bottom app bar — a full-width slab pinned to the
 * edge of the screen — with a pill that floats above the content. It costs
 * less width than it looks like it does, it can sit beside a FAB, and because
 * content scrolls visibly underneath it, it reads as a layer over the screen
 * rather than a border around it.
 *
 * A toolbar can also carry the screen's primary action itself, as a filled
 * item among the plain ones (`prominent`). That is the Expressive alternative
 * to a separate FAB: one control in one place, with the important action
 * wearing the container colour and a label, and its neighbours reduced to
 * icons. It is worth it when the primary action has obvious company — a
 * screen with nothing to sit beside it is still a FAB's job.
 *
 * Each item springs down under the finger; there is no ripple-only press state
 * here, because at this size a ripple alone is easy to miss.
 */

/** Height of the pill, and of the reach target it has to keep. */
const TOOLBAR_HEIGHT = 64;

/**
 * For a toolbar that has to share the screen with the keyboard instead of
 * owning the bottom of it: the pill loses its padding and the buttons draw
 * smaller, with the reach they give up handed back as `hitSlop` so the
 * target stays 48dp even though only 40dp of it is painted.
 */
const COMPACT_TOOLBAR_HEIGHT = 40;
/** The smallest target a control is allowed to have, painted or not. */
const MINIMUM_TARGET = 48;
const COMPACT_HIT_SLOP = (MINIMUM_TARGET - COMPACT_TOOLBAR_HEIGHT) / 2;

export interface ToolbarItem {
  id: string;
  disabled?: boolean;
  icon: React.ComponentType<IconProps>;
  label: string;
  onPress: () => void;
  /** Overrides the icon colour, for a state like "starred". */
  color?: string;
  /** Filled icons read as "on" for toggles. */
  fill?: string;
  /**
   * Marks the item as the one currently in charge — a tool whose own panel is
   * open, rather than a value that is set. It takes the container tone and
   * squares its corners off, which is how M3 separates a selected toggle from
   * its neighbours without adding a second row of chrome.
   */
  active?: boolean;
  /**
   * Colours the rule the icon already draws — the bar under the A, under the
   * pen — with the colour the item would apply. Only symbols that carry one
   * have anything to colour.
   */
  rule?: string;
  /**
   * Renders the item as the toolbar's primary action: a filled pill that
   * shows its label instead of relying on the icon alone. At most one.
   */
  prominent?: boolean;
  /** A count to overlay on the icon. Zero and below draw nothing. */
  badge?: number;
}

export interface ToolbarProps extends MaterialOptions {
  items: ToolbarItem[];
  children?: React.ReactNode;
  material?: 'auto' | 'glass' | 'solid';
  className?: string;
  /** Motion from `useToolbarAutoHide`, when the toolbar scrolls away. */
  style?: React.ComponentProps<typeof Animated.View>['style'];
  /** Slims the pill down around the same targets — see `COMPACT_TOOLBAR_HEIGHT`. */
  compact?: boolean;
}

export function Toolbar(props: ToolbarProps | ToolbarContainerProps) {
  const colors = useThemeColors();
  const ios = useIsolinePlatform() === 'ios';
  if (!('items' in props)) return <ContainerToolbar {...props} />;
  const {
    items,
    className,
    style,
    compact,
    material = 'auto',
    glassStyle,
    tintColor,
    fallbackColor,
    interactive = false,
  } = props;
  const Root = (Platform.OS === 'web' ? View : Animated.View) as typeof Animated.View;
  return (
    <Root
      className={className}
      style={[
        { height: compact ? COMPACT_TOOLBAR_HEIGHT : TOOLBAR_HEIGHT, flexDirection: 'row' },
        style,
      ]}
      accessibilityRole="toolbar"
    >
      <Surface
        material={ios ? material : 'solid'}
        glassStyle={glassStyle}
        tintColor={tintColor}
        fallbackColor={fallbackColor ?? colors.surfaceContainerHigh}
        interactive={interactive}
        style={{
          height: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingHorizontal: compact ? 12 : 8,
          borderRadius: compact ? 20 : 32,
        }}
      >
        {items.map((item) =>
          item.prominent ? (
            <ProminentButton key={item.id} item={item} />
          ) : (
            <ToolbarButton key={item.id} item={item} compact={compact} />
          ),
        )}
      </Surface>
    </Root>
  );
}

/** Shared press physics: the item is pushed down, then springs back. */
function usePressScale() {
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlers = {
    onPressIn: () => {
      scale.value = withSpring(0.86, spatial.fast);
    },
    onPressOut: () => {
      scale.value = withSpring(1, spatial.default);
    },
  };

  return { style, handlers };
}

function ToolbarButton({ item, compact }: { item: ToolbarItem; compact?: boolean }) {
  const { selectionHaptic } = useHaptics();
  const colors = useThemeColors();
  const ripple = useRipple();
  const { style, handlers } = usePressScale();
  const Box = (Platform.OS === 'web' ? View : Animated.View) as typeof Animated.View;
  const Icon = item.icon;
  const iconColor =
    item.color ?? (item.active ? colors.onSecondaryContainer : colors.onSurfaceVariant);

  return (
    // An active item is a filled shape, so its ripple has to be clipped to
    // that shape rather than spreading past it the way a borderless one over
    // a bare icon is meant to.
    <Box
      style={Platform.OS === 'web' ? undefined : style}
      className={cn(item.active && 'overflow-hidden rounded-xl')}
    >
      <Pressable
        disabled={item.disabled}
        style={{ opacity: item.disabled ? 0.4 : 1 }}
        {...handlers}
        onPress={() => {
          selectionHaptic();
          item.onPress();
        }}
        android_ripple={
          item.active
            ? { color: ripple.onTonal }
            : { color: ripple.onNeutral, borderless: true, radius: compact ? 20 : 26 }
        }
        hitSlop={compact ? COMPACT_HIT_SLOP : undefined}
        // A compact toolbar sits beside a focused field and acts on it, so
        // its buttons must not take the focus away from what they format.
        // (Input focus only; a screen reader still reaches them.)
        focusable={!compact}
        accessibilityRole="button"
        accessibilityState={{ selected: item.active, disabled: item.disabled }}
        accessibilityLabel={item.label}
        className={cn(
          'items-center justify-center',
          compact ? 'h-10 w-10' : 'h-12 w-12',
          item.active ? 'rounded-xl bg-secondaryContainer' : 'rounded-full',
        )}
      >
        <Icon
          size={compact ? 20 : 22}
          color={iconColor}
          {...(item.fill ? { fill: item.fill } : null)}
          {...(item.rule ? { ruleColor: item.rule } : null)}
        />
        <Badge count={item.badge} />
      </Pressable>
    </Box>
  );
}

/**
 * The toolbar's primary action.
 *
 * Filled in the container tone the FAB used, so the action that used to sit
 * in the corner keeps its colour and its weight when it moves inline. The
 * label stays visible: this is the one item whose target the user aims for
 * without having to read an icon first.
 */
function ProminentButton({ item }: { item: ToolbarItem }) {
  const { impactHaptic } = useHaptics();
  const colors = useThemeColors();
  const ripple = useRipple();
  const { style, handlers } = usePressScale();
  const Box = (Platform.OS === 'web' ? View : Animated.View) as typeof Animated.View;
  const Icon = item.icon;

  return (
    <Box
      style={Platform.OS === 'web' ? undefined : style}
      className="overflow-hidden rounded-full"
    >
      <Pressable
        disabled={item.disabled}
        style={{ opacity: item.disabled ? 0.4 : 1 }}
        {...handlers}
        onPress={() => {
          impactHaptic('light');
          item.onPress();
        }}
        android_ripple={{ color: ripple.onTonal }}
        accessibilityRole="button"
        accessibilityLabel={item.label}
        className="h-12 flex-row items-center gap-2 rounded-full bg-primaryContainer pl-4 pr-5"
      >
        <Icon size={20} color={colors.onPrimaryContainer} />
        <Text className="text-[15px] font-semibold text-onPrimaryContainer">{item.label}</Text>
      </Pressable>
    </Box>
  );
}

function Badge({ count }: { count?: number }) {
  if (!count || count <= 0) return null;

  return (
    <View className="absolute right-1 top-1.5 min-w-[18px] items-center rounded-full bg-primary px-1">
      <Text className="text-[11px] font-bold tabular-nums text-primary-foreground">
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
}

/**
 * Scrolls the toolbar away downwards, and brings it back on the way up.
 *
 * The point of a floating toolbar is that it is a layer over the content
 * rather than a permanent border around it — so it gets out of the way while
 * the user is reading, and returns the moment they reverse, without having to
 * reach the top of the list first.
 *
 * The scroll handler is a plain JS one on purpose: it only writes shared
 * values, so it never re-renders the screen, and it works on `FlashList`
 * without wrapping the list in `Animated.createAnimatedComponent`.
 *
 * @param travel How far down to send it — far enough to clear the screen edge,
 *   so a hidden toolbar cannot be tapped.
 */
export interface ToolbarAutoHide {
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  style: AnimatedStyle<ViewStyle>;
}
export function useToolbarAutoHide(travel: number): ToolbarAutoHide {
  const hidden = useSharedValue(0);
  const [webHidden, setWebHidden] = React.useState(false);
  const reducedMotion = useReducedMotion();
  // Where the last decision was made, not the last frame: comparing against
  // the previous frame turns any jitter into a flicker.
  const anchor = useSharedValue(0);

  const onScroll = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      const delta = y - anchor.value;

      // A drag has to mean it. Below this, the toolbar holds its state.
      if (Math.abs(delta) < 16) return;
      anchor.value = y;

      // The first rows are still "the top of the inbox": nothing hides there,
      // however the list is being dragged.
      const away = delta > 0 && y > TOOLBAR_HEIGHT;
      hidden.value = away ? 1 : 0;
      if (Platform.OS === 'web') setWebHidden(away);
    },
    [anchor, hidden],
  );

  const style = useAnimatedStyle(() => {
    const away = hidden.value;

    return {
      transform: [{ translateY: withSpring(away * travel, spatial.default) }],
      // Translate the material off-screen; opacity would flatten native glass.
    };
  });

  return {
    onScroll,
    style:
      Platform.OS === 'web'
        ? ({
            transform: [{ translateY: webHidden ? travel : 0 }],
            transitionProperty: 'transform',
            transitionDuration: reducedMotion ? '0ms' : '180ms',
          } as ViewStyle)
        : style,
  };
}

export interface ToolbarContainerProps extends ViewProps, MaterialOptions {
  /** Floating navigation uses glass on supported iOS when a surface adapter is supplied. */
  material?: 'auto' | 'glass' | 'solid';
}
function ContainerToolbar({
  material = 'auto',
  glassStyle,
  tintColor,
  fallbackColor,
  interactive,
  style,
  className,
  ...props
}: ToolbarContainerProps) {
  const ios = useIsolinePlatform() === 'ios';
  return (
    <Surface
      {...props}
      material={ios ? material : 'solid'}
      glassStyle={glassStyle}
      tintColor={tintColor}
      fallbackColor={fallbackColor}
      interactive={interactive}
      className={cn('flex-row items-center justify-between gap-3', className)}
      style={[
        {
          minHeight: 56,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: ios ? 28 : 20,
        },
        style,
      ]}
    />
  );
}
export interface NavigationBarProps extends ToolbarContainerProps {
  title: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}
export function NavigationBar({ title, leading, trailing, ...props }: NavigationBarProps) {
  const ios = useIsolinePlatform() === 'ios';
  return (
    <ContainerToolbar {...props}>
      <View style={{ minWidth: 44 }}>{leading}</View>
      <Text
        accessibilityRole="header"
        variant="subject"
        style={{ flex: 1, textAlign: ios ? 'center' : 'left' }}
      >
        {title}
      </Text>
      <View style={{ minWidth: 44, alignItems: 'flex-end' }}>{trailing}</View>
    </ContainerToolbar>
  );
}
