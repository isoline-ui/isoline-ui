import * as React from 'react';
import { BackHandler, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Plus, type IconProps } from './icons.tsx';
import { Pressable } from './pressable.tsx';
import { Text } from './text.tsx';
import { useHaptics, useLabels } from '../provider.tsx';
import { spatial, staggerFor } from '../motion.ts';
import { useReducedMotion } from '../reduced-motion.ts';
import { elevation, useRipple, useThemeColors } from '../provider.tsx';

export interface FabMenuAction {
  id: string;
  label: string;
  icon: React.ComponentType<IconProps>;
  run: () => void;
}
export interface FabMenuProps {
  bottom: number;
  label: string;
  actions: FabMenuAction[];
}

/**
 * The button's closed size: the height of the floating navigation bar it
 * sits beside, so the two read as one row — and round, as the bar is.
 */
export const FAB_MENU_SIZE = 64;
const CLOSE_SIZE = 56;

/**
 * The capture button, as an Expressive FAB menu.
 *
 * Closed, it is the one tinted circle beside the navigation bar (or, in a
 * collection, in the corner). Open, it shrinks into a smaller close button
 * while the ways in — link or text, file, scan, camera — unfold above it one after
 * another, each a full-width pill with its name on it. Everything else dims;
 * nothing about capturing asks where a thing goes. Only ways in: a list is
 * written, not captured, and is started from Collections or a collection's menu.
 */
export function FabMenu({ bottom, label, actions }: FabMenuProps) {
  const labels = useLabels();
  const { selectionHaptic, impactHaptic } = useHaptics();
  const colors = useThemeColors();
  const ripple = useRipple();
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = React.useState(false);
  const progress = useSharedValue(0);

  React.useEffect(() => {
    // The calmer spatial spring: the button settles with a hint of give
    // rather than wobbling through its size and rotation.
    progress.value = withSpring(open ? 1 : 0, spatial.default);
    if (!open) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setOpen(false);
      return true;
    });
    return () => subscription.remove();
  }, [open, progress]);

  const fabStyle = useAnimatedStyle(() => {
    const size = FAB_MENU_SIZE + (CLOSE_SIZE - FAB_MENU_SIZE) * progress.value;
    return {
      width: size,
      height: size,
      // Round, like the pill beside it, at every size it passes through.
      borderRadius: size / 2,
      backgroundColor: progress.value > 0.5 ? colors.primary : colors.primaryContainer,
    };
  });
  const iconStyle = useAnimatedStyle(() => ({
    // An eighth of a turn: the plus becomes a cross without spinning.
    transform: [{ rotate: `${progress.value * 45}deg` }],
  }));

  const choose = (run: () => void) => {
    selectionHaptic();
    setOpen(false);
    run();
  };

  return (
    <>
      {open ? (
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(120)}
          className="absolute inset-0 bg-black/40"
        >
          <Pressable
            className="flex-1"
            onPress={() => setOpen(false)}
            accessibilityLabel={labels.close}
          />
        </Animated.View>
      ) : null}

      <View
        pointerEvents="box-none"
        className="absolute right-4 items-end gap-3"
        style={{ bottom }}
      >
        {open
          ? actions.map((action, index) => {
              const Icon = action.icon;
              // Nearest the button first, so the menu unfolds upwards.
              const order = actions.length - 1 - index;
              return (
                <Animated.View
                  key={action.id}
                  entering={FadeInDown.springify()
                    .stiffness(spatial.default.stiffness)
                    .damping(spatial.default.damping)
                    .delay(order * staggerFor(reducedMotion))}
                  exiting={FadeOutDown.duration(100)}
                  className="overflow-hidden rounded-full"
                  style={{ elevation: elevation.level2 }}
                >
                  <Pressable
                    onPress={() => choose(action.run)}
                    android_ripple={{ color: ripple.onTonal }}
                    accessibilityRole="button"
                    className="h-14 flex-row items-center gap-3 rounded-full bg-primaryContainer pl-5 pr-6"
                  >
                    <Icon size={24} color={colors.onPrimaryContainer} />
                    <Text className="text-base font-semibold text-onPrimaryContainer">
                      {action.label}
                    </Text>
                  </Pressable>
                </Animated.View>
              );
            })
          : null}

        <Animated.View
          style={[fabStyle, { elevation: elevation.level3 }]}
          className="overflow-hidden"
        >
          <Pressable
            onPress={() => {
              impactHaptic('light');
              setOpen((value) => !value);
            }}
            android_ripple={{ color: ripple.onTonal }}
            accessibilityRole="button"
            accessibilityLabel={open ? labels.close : label}
            accessibilityState={{ expanded: open }}
            className="flex-1 items-center justify-center"
          >
            <Animated.View style={iconStyle}>
              <Plus
                size={open ? 24 : 28}
                color={open ? colors.onPrimary : colors.onPrimaryContainer}
              />
            </Animated.View>
          </Pressable>
        </Animated.View>
      </View>
    </>
  );
}
