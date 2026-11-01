import * as React from 'react';
import { Dimensions, Modal, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

import { ChevronUp } from './icons.tsx';
import { AnimatedPressable, Pressable } from './pressable.tsx';
import { Text } from './text.tsx';
import { useHaptics } from '../provider.tsx';
import { STAGGER_MS, spatial } from '../motion.ts';
import { useReducedMotion } from '../reduced-motion.ts';
import { staggerFor } from '../motion.ts';
import { corner } from '../shape.ts';
import { elevation, useRipple, useThemeColors } from '../provider.tsx';

/**
 * Material 3 Expressive split button.
 *
 * One control holding a primary action and the variations on it: tapping the
 * leading half does the obvious thing, tapping the trailing half offers the
 * alternatives. It exists so the common case stays one tap while the rarer
 * ones stop needing a separate button each.
 *
 * The trailing half is where the Expressive part lives — on activation its
 * chevron spins and its outer corners morph from a pill to a small radius, so
 * the button visibly *becomes* the open menu's anchor rather than just
 * toggling a highlight.
 */

export interface SplitButtonAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  onPress: () => void;
}

export interface SplitButtonProps {
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  onPress: () => void;
  actions: SplitButtonAction[];
  optionsLabel?: string;
}

/** The two halves sit a hair apart, which is what reads as "split". */
const HAIRLINE = 2;
const HEIGHT = 56;

export function SplitButton({
  label,
  icon: Icon,
  onPress,
  actions,
  optionsLabel,
}: SplitButtonProps) {
  const colors = useThemeColors();
  const { selectionHaptic } = useHaptics();
  const ripple = useRipple();
  const [open, setOpen] = React.useState(false);
  // Zero under reduced motion: the menu's rows unfolding one after another is
  // the effect itself, and with nothing moving a delay only makes the last row
  // arrive late.
  const stagger = staggerFor(useReducedMotion(), STAGGER_MS);
  // Where to pin the menu, measured off the trailing half as it opens.
  const [anchor, setAnchor] = React.useState({ right: 12, bottom: 12 });
  const trailingRef = React.useRef<React.ElementRef<typeof View>>(null);
  const progress = useSharedValue(0);

  const close = React.useCallback(() => {
    setOpen(false);
    progress.value = withSpring(0, spatial.default);
  }, [progress]);

  /**
   * The menu lives in a modal rather than in an absolutely positioned sibling,
   * because on Android a view drawn outside its parent's bounds never receives
   * the touch — the menu would appear above the button and then ignore taps.
   * Measuring the trailing half first is what keeps it looking anchored to it.
   */
  const openMenu = React.useCallback(() => {
    trailingRef.current?.measureInWindow((x, y, width) => {
      const window = Dimensions.get('window');

      setAnchor({
        right: Math.max(12, window.width - (x + width)),
        bottom: Math.max(12, window.height - y + 12),
      });
      setOpen(true);
      selectionHaptic();
      progress.value = withSpring(1, spatial.default);
    });
  }, [progress, selectionHaptic]);

  const trailingStyle = useAnimatedStyle(() => {
    const pill = HEIGHT / 2;
    const radius = pill + (corner.medium - pill) * progress.value;

    return { borderTopRightRadius: radius, borderBottomRightRadius: radius };
  });

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 180}deg` }],
  }));

  return (
    <View>
      <Modal visible={open} transparent animationType="none" onRequestClose={close}>
        <View className="flex-1">
          <Pressable className="absolute inset-0" onPress={close} accessible={false} />

          <View
            className="absolute overflow-hidden rounded-[28px] bg-surfaceContainerHigh py-2"
            style={{
              right: anchor.right,
              bottom: anchor.bottom,
              minWidth: 220,
              elevation: elevation.level3,
            }}
          >
            {actions.map((action, index) => (
              <MenuRow
                key={action.id}
                action={action}
                delay={index * stagger}
                onRun={() => {
                  close();
                  action.onPress();
                }}
              />
            ))}
          </View>
        </View>
      </Modal>

      <View className="flex-row" style={{ gap: HAIRLINE }}>
        {/* The ripple's own corner radius has to come from clipping a wrapper,
            not from the Pressable's own borderRadius: Android's ripple mask
            can only express one radius for all four corners, and this button
            mixes a full pill on the left with a small radius on the right. */}
        <View
          className="overflow-hidden rounded-l-full rounded-r-lg"
          style={{ elevation: elevation.level2 }}
        >
          <Pressable
            onPress={onPress}
            android_ripple={{ color: ripple.onTonal }}
            accessibilityRole="button"
            className="flex-row items-center gap-2 rounded-l-full rounded-r-lg bg-primaryContainer pl-6 pr-5"
            style={{ height: HEIGHT }}
          >
            <Icon size={20} color={colors.onPrimaryContainer} />
            <Text className="text-base font-semibold text-onPrimaryContainer">{label}</Text>
          </Pressable>
        </View>

        <View ref={trailingRef} collapsable={false}>
          <Animated.View
            style={[trailingStyle, { elevation: elevation.level2 }]}
            className="overflow-hidden rounded-l-lg"
          >
            {/* The ripple has to carry the same (animated) corner radius as
                this wrapper, or it shows hard corners while the pill morphs
                to a menu anchor — `overflow-hidden` above clips the fill but
                not the ripple's own outline. */}
            <AnimatedPressable
              onPress={() => (open ? close() : openMenu())}
              android_ripple={{ color: ripple.onTonal }}
              accessibilityRole="button"
              accessibilityLabel={optionsLabel ?? label}
              accessibilityState={{ expanded: open }}
              className="items-center justify-center rounded-l-lg bg-primaryContainer px-4"
              style={[trailingStyle, { height: HEIGHT }]}
            >
              <Animated.View style={chevronStyle}>
                <ChevronUp size={20} color={colors.onPrimaryContainer} />
              </Animated.View>
            </AnimatedPressable>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

function MenuRow({
  action,
  delay,
  onRun,
}: {
  action: SplitButtonAction;
  delay: number;
  onRun: () => void;
}) {
  const colors = useThemeColors();
  const ripple = useRipple();
  const entrance = useSharedValue(0);
  const Icon = action.icon;

  React.useEffect(() => {
    entrance.value = withDelay(delay, withSpring(1, spatial.fast));
  }, [delay, entrance]);

  const style = useAnimatedStyle(() => ({
    opacity: entrance.value,
    transform: [{ translateY: (1 - entrance.value) * 12 }],
  }));

  return (
    <Animated.View style={style}>
      <Pressable
        onPress={onRun}
        android_ripple={{ color: ripple.onNeutral }}
        accessibilityRole="menuitem"
        className="flex-row items-center gap-3 px-5 py-3.5"
      >
        <Icon size={20} color={colors.onSurfaceVariant} />
        <Text className="text-[15px] text-onSurface">{action.label}</Text>
      </Pressable>
    </Animated.View>
  );
}
