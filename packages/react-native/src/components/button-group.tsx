import * as React from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

import { AnimatedPressable } from './pressable.tsx';
import { Text } from './text.tsx';
import { useHaptics } from '../provider.tsx';
import { corner } from '../shape.ts';
import { spatial } from '../motion.ts';
import { useRipple, useThemeColors } from '../provider.tsx';
import { cn } from '../utils.ts';

/**
 * Material 3 Expressive connected button group.
 *
 * A row of buttons that behave as one object. Two things make it Expressive
 * rather than a row of chips:
 *
 * - **Shape as state.** The selected button's corners morph from the group's
 *   small inner radius to a full pill, so which one is active is legible from
 *   silhouette alone, before any colour is read.
 * - **The squeeze.** Pressing a button widens it and compresses its immediate
 *   neighbours. The group has a fixed width, so the buttons behave like
 *   objects sharing a space rather than independent targets — which is what
 *   tells you they are one control.
 *
 * Both run on spatial springs, so a fast double-tap redirects the motion mid
 * flight instead of queueing two animations.
 */

/** How much a pressed button grows, and its neighbours give up, as flex. */
const PRESS_GROWTH = 0.18;
const NEIGHBOUR_SQUEEZE = 0.09;

export interface ButtonGroupItem<T extends string> {
  id: T;
  label: string;
  icon?: React.ComponentType<{ size?: number; color?: string }>;
  /** Optional trailing count, e.g. unread mail in that view. */
  badge?: number;
}

export interface ButtonGroupProps<T extends string> {
  items: ButtonGroupItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  /**
   * Drop the label on unselected buttons, leaving icon + badge. Meant for
   * groups where every item carries a badge, so the count alone still
   * identifies it — the selected button keeps the only visible label.
   */
  compact?: boolean;
}

export function ButtonGroup<T extends string>({
  items,
  value,
  onChange,
  className,
  compact,
}: ButtonGroupProps<T>) {
  // Which button is under a finger, as an index. -1 is "none", and lives on
  // the UI thread so the squeeze never waits on a React render.
  const pressed = useSharedValue(-1);

  return (
    <View className={cn('flex-row gap-1', className)}>
      {items.map((item, index) => (
        <GroupButton
          key={item.id}
          item={item}
          index={index}
          count={items.length}
          selected={item.id === value}
          compact={compact ?? false}
          pressed={pressed}
          onPress={() => onChange(item.id)}
        />
      ))}
    </View>
  );
}

function GroupButton<T extends string>({
  item,
  index,
  count,
  selected,
  compact,
  pressed,
  onPress,
}: {
  item: ButtonGroupItem<T>;
  index: number;
  count: number;
  selected: boolean;
  compact: boolean;
  pressed: SharedValue<number>;
  onPress: () => void;
}) {
  const { selectionHaptic } = useHaptics();
  const colors = useThemeColors();
  const ripple = useRipple();
  const Icon = item.icon;
  const first = index === 0;
  const last = index === count - 1;

  // The group's outer corners are round; the shared inner edges are not, so
  // the row reads as one segmented object rather than as separate pills.
  const outer = corner.extraLarge;
  const inner = corner.small;

  const shape = useSharedValue(selected ? 1 : 0);

  React.useEffect(() => {
    shape.value = withSpring(selected ? 1 : 0, spatial.default);
  }, [selected, shape]);

  // In compact mode, unselected buttons hug their icon+badge content instead
  // of sharing the row evenly, so the freed width goes to the selected
  // button's label rather than sitting empty inside its neighbours.
  const flexStyle = useAnimatedStyle(() => {
    if (compact) {
      const grow = selected ? 1 : 0;
      return { flexGrow: withSpring(grow, spatial.default), flexShrink: grow };
    }

    const distance = pressed.value < 0 ? 99 : Math.abs(pressed.value - index);

    const flex = distance === 0 ? 1 + PRESS_GROWTH : distance === 1 ? 1 - NEIGHBOUR_SQUEEZE : 1;

    return { flex: withSpring(flex, spatial.fast) };
  });

  // Selected morphs every corner to a pill; unselected keeps the group's
  // segmented silhouette. Applied to the Pressable itself, not just the
  // wrapping View, or the ripple shows hard corners through the morph.
  const radiusStyle = useAnimatedStyle(() => {
    const radius = (base: number) => base + (corner.extraExtraLarge - base) * shape.value;

    return {
      borderTopLeftRadius: withSpring(radius(first ? outer : inner), spatial.default),
      borderBottomLeftRadius: withSpring(radius(first ? outer : inner), spatial.default),
      borderTopRightRadius: withSpring(radius(last ? outer : inner), spatial.default),
      borderBottomRightRadius: withSpring(radius(last ? outer : inner), spatial.default),
    };
  });

  // The static style gives the animated flex above a value to spring from
  // (and to render correctly before the first frame), matching what it
  // settles into: an even share normally, or grow-to-fill vs. hug-content
  // once compact mode gives each button a different role.
  const staticFlexStyle = compact
    ? { flexGrow: selected ? 1 : 0, flexShrink: selected ? 1 : 0 }
    : { flex: 1 };

  return (
    <Animated.View
      style={[staticFlexStyle, flexStyle, radiusStyle]}
      className="overflow-hidden"
    >
      <AnimatedPressable
        onPressIn={() => {
          pressed.set(index);
        }}
        onPressOut={() => {
          pressed.set(-1);
        }}
        onPress={() => {
          if (!selected) selectionHaptic();
          onPress();
        }}
        android_ripple={{ color: selected ? ripple.onTonal : ripple.onNeutral }}
        accessibilityRole="button"
        accessibilityLabel={item.label}
        accessibilityState={{ selected }}
        className={cn(
          'h-12 flex-row items-center justify-center gap-1.5 px-3',
          selected ? 'bg-primaryContainer' : 'bg-surfaceContainerHigh',
        )}
        style={radiusStyle}
      >
        {Icon ? (
          <Icon
            size={18}
            color={selected ? colors.onPrimaryContainer : colors.onSurfaceVariant}
          />
        ) : null}

        {selected || !compact ? (
          <Text
            numberOfLines={1}
            className={cn(
              'text-sm font-semibold',
              selected ? 'text-onPrimaryContainer' : 'text-onSurfaceVariant',
            )}
          >
            {item.label}
          </Text>
        ) : null}

        {item.badge ? (
          <View className="min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 py-0.5">
            <Text className="text-xs font-bold tabular-nums text-primary-foreground">
              {item.badge}
            </Text>
          </View>
        ) : null}
      </AnimatedPressable>
    </Animated.View>
  );
}
