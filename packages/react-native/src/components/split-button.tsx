import * as React from 'react';
import { Platform, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import {
  Surface,
  SurfaceGroup,
  useIsolinePlatform,
  type MaterialOptions,
} from '../provider.tsx';
import { Popover } from './popover.tsx';
import { ContextMenuRows } from './context-menu.tsx';
import { ChevronUp } from './icons.tsx';
import { AnimatedPressable, Pressable } from './pressable.tsx';
import { Text } from './text.tsx';
import { useHaptics } from '../provider.tsx';
import { spatial } from '../motion.ts';
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
  disabled?: boolean;
  destructive?: boolean;
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  onPress: () => void;
}

export interface SplitButtonProps extends MaterialOptions {
  menuMaterial?: MaterialOptions['material'];
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
  material = 'solid',
  menuMaterial = 'auto',
  glassStyle,
  tintColor,
  fallbackColor,
  interactive = true,
}: SplitButtonProps) {
  const glass = useIsolinePlatform() === 'ios' && material !== 'solid';
  const web = Platform.OS === 'web';
  const Piece = glass ? Surface : View;
  const Trailing = (glass ? Surface : web ? View : Animated.View) as typeof Animated.View;
  const Control = (web ? Pressable : AnimatedPressable) as typeof AnimatedPressable;
  const colors = useThemeColors();
  const { selectionHaptic } = useHaptics();
  const ripple = useRipple();
  const [open, setOpen] = React.useState(false);
  // Where to pin the menu, measured off the trailing half as it opens.
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
    setOpen(true);
    selectionHaptic();
    progress.value = withSpring(1, spatial.default);
  }, [selectionHaptic, progress]);

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
      <Popover
        visible={open}
        onClose={close}
        anchorRef={trailingRef}
        placement="top"
        accessibilityLabel={optionsLabel ?? label}
        material={menuMaterial}
        glassStyle={glassStyle}
        tintColor={tintColor}
        fallbackColor={fallbackColor}
      >
        <ContextMenuRows items={actions} onClose={close} />
      </Popover>

      <SurfaceGroup spacing={12} style={{ flexDirection: 'row', gap: HAIRLINE }}>
        {/* The ripple's own corner radius has to come from clipping a wrapper,
            not from the Pressable's own borderRadius: Android's ripple mask
            can only express one radius for all four corners, and this button
            mixes a full pill on the left with a small radius on the right. */}
        <Piece
          {...(glass ? { material, glassStyle, tintColor, fallbackColor, interactive } : {})}
          style={{
            elevation: elevation.level2,
            borderTopLeftRadius: 28,
            borderBottomLeftRadius: 28,
            borderTopRightRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          <Pressable
            onPress={onPress}
            android_ripple={{ color: ripple.onTonal }}
            accessibilityRole="button"
            className="flex-row items-center gap-2 rounded-l-full rounded-r-lg bg-primaryContainer pl-6 pr-5"
            style={{ height: HEIGHT, ...(glass ? { backgroundColor: 'transparent' } : {}) }}
          >
            <Icon size={20} color={glass ? colors.primary : colors.onPrimaryContainer} />
            <Text
              className="text-base font-semibold text-onPrimaryContainer"
              style={glass ? { color: colors.primary } : undefined}
            >
              {label}
            </Text>
          </Pressable>
        </Piece>

        <View ref={trailingRef} collapsable={false}>
          <Trailing
            {...(glass ? { material, glassStyle, tintColor, fallbackColor, interactive } : {})}
            style={[
              !web && !glass && trailingStyle,
              {
                elevation: elevation.level2,
                borderTopRightRadius: open ? 12 : 28,
                borderBottomRightRadius: open ? 12 : 28,
                borderTopLeftRadius: 8,
                borderBottomLeftRadius: 8,
              },
            ]}
            className="overflow-hidden rounded-l-lg"
          >
            {/* The ripple has to carry the same (animated) corner radius as
                this wrapper, or it shows hard corners while the pill morphs
                to a menu anchor — `overflow-hidden` above clips the fill but
                not the ripple's own outline. */}
            <Control
              onPress={() => (open ? close() : openMenu())}
              android_ripple={{ color: ripple.onTonal }}
              accessibilityRole="button"
              accessibilityLabel={optionsLabel ?? label}
              accessibilityState={{ expanded: open }}
              className="items-center justify-center rounded-l-lg bg-primaryContainer px-4"
              style={[
                !web && !glass && trailingStyle,
                {
                  height: HEIGHT,
                  borderTopRightRadius: open ? 12 : 28,
                  borderBottomRightRadius: open ? 12 : 28,
                  ...(glass ? { backgroundColor: 'transparent' } : {}),
                },
              ]}
            >
              <Animated.View style={chevronStyle}>
                <ChevronUp
                  size={20}
                  color={glass ? colors.primary : colors.onPrimaryContainer}
                />
              </Animated.View>
            </Control>
          </Trailing>
        </View>
      </SurfaceGroup>
    </View>
  );
}
