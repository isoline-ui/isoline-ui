import * as React from 'react';
import Animated from 'react-native-reanimated';

import { type IconProps } from './icons.tsx';
import { Pressable } from './pressable.tsx';
import { useSquish } from './squish.ts';
import { Text } from './text.tsx';
import { corner } from '../shape.ts';
import { useRipple, useThemeColors } from '../provider.tsx';
import { cn } from '../utils.ts';

/**
 * Material 3 filter chip — the app's one selectable pill.
 *
 * Unselected it reads as an offer, selected it fills with the primary
 * container. Both states are drawn from the same set of style properties;
 * only the colour values change. That is load-bearing on Android, and it is
 * why an unselected chip paints an opaque fill in its own surface's tone
 * rather than simply leaving the background unset:
 *
 * React Native builds a view's background out of layers — fill, border,
 * ripple — held in a single drawable. Adding a *layer* that wasn't there
 * before (a fill appearing on select, a border appearing on deselect)
 * replaces that drawable with a freshly constructed one, and a fresh drawable
 * starts with empty bounds. A view with `overflow: hidden` clips its children
 * to those bounds, so for as long as they stay empty the chip paints its fill
 * and nothing else: the icon and the label are laid out at full size but
 * never drawn. That is the bug this shape avoids — and `overflow: hidden` is
 * not optional here, since a contained ripple has to be clipped to the pill
 * (see `pressable.tsx`).
 *
 * So: a fill and a border in *both* states, and selection expressed as
 * colour. `surface` is what an unselected chip fills with, which has to match
 * whatever the chip is sitting on for "off" to read as unfilled.
 *
 * The same reasoning rules out swapping the leading icon for a checkmark on
 * select: everything about the chip's structure stays put across a toggle,
 * and only colour moves. Selection stays legible without colour from the
 * filled silhouette, the same way it does in `button-group.tsx` — the one
 * selectable control in the app that never lost its label, and the shape this
 * chip is now built to match.
 *
 * The radius is a real dp value rather than `rounded-full`: Tailwind's full
 * radius is 9999, and `button-group.tsx` likewise morphs between numbers from
 * the corner scale.
 */

/** The tones a chip can sit on, as the fill an unselected chip paints. */
const SURFACE_FILL = {
  background: 'bg-background',
  surfaceContainerHigh: 'bg-surfaceContainerHigh',
  /** Bottom sheets and dialogs. */
  popover: 'bg-popover',
} as const;

export interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  /**
   * A second, deliberate action on the same chip — removing a saved search,
   * say. Optional: a chip that only filters has nothing to hide behind a hold.
   */
  onLongPress?: () => void;
  /** Optional leading icon. Drawn in both states, or in neither. */
  icon?: React.ComponentType<IconProps>;
  /**
   * Optional trailing icon — a chevron on a chip that opens a choice rather
   * than toggling. Drawn in both states, like `icon`.
   */
  trailingIcon?: React.ComponentType<IconProps>;
  /**
   * The tone the chip is drawn on. An unselected chip fills with it rather
   * than staying transparent, so its fill is a colour change away from the
   * selected one rather than a new drawable layer.
   */
  surface?: keyof typeof SURFACE_FILL;
}

export function FilterChip({
  label,
  selected,
  onPress,
  onLongPress,
  icon: Icon,
  trailingIcon: Trailing,
  surface = 'background',
}: FilterChipProps) {
  const colors = useThemeColors();
  const ripple = useRipple();

  const foreground = selected ? colors.onPrimaryContainer : colors.onSurfaceVariant;
  const squish = useSquish();

  // Fill and clip on a plain wrapper, with the same radius on the Pressable
  // inside it, so the contained ripple is clipped to the pill rather than to
  // its bounding box.
  return (
    <Animated.View
      className="shrink-0 overflow-hidden"
      style={[{ borderRadius: corner.large }, squish.style]}
    >
      <Pressable
        {...squish.handlers}
        onPress={onPress}
        onLongPress={onLongPress}
        // A 32dp chip is under the 48dp touch target on its own.
        hitSlop={{ top: 8, bottom: 8 }}
        android_ripple={{ color: selected ? ripple.onTonal : ripple.onNeutral }}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        className={cn(
          'min-h-8 flex-row items-center gap-1.5 border px-3 py-1',
          selected
            ? 'border-primaryContainer bg-primaryContainer'
            : cn('border-outline', SURFACE_FILL[surface]),
        )}
        style={{ borderRadius: corner.large }}
      >
        {Icon ? <Icon size={16} color={foreground} /> : null}

        {/* Coloured inline from the same value the icon uses, rather than
            through a class, so the two cannot diverge and the label keeps a
            colour even if the class does not resolve. */}
        <Text variant="labelLarge" numberOfLines={1} style={{ color: foreground }}>
          {label}
        </Text>
        {Trailing ? <Trailing size={16} color={foreground} /> : null}
      </Pressable>
    </Animated.View>
  );
}
