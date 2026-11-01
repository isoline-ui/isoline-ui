import * as React from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { ChevronDown } from './icons.tsx';
import { spatial } from '../motion.ts';
import { useThemeColors } from '../provider.tsx';

/** One size for every disclosure chevron, so no two sections look differently foldable. */
export const EXPAND_INDICATOR_SIZE = 20;

export interface ExpandIndicatorProps {
  expanded: boolean;
  /** Defaults to `onSurfaceVariant`; a chip in its selected tone passes its own. */
  color?: string;
}

/**
 * The chevron on anything that opens in place — a message card, its details,
 * the Cc/Bcc fields.
 *
 * Every one of those used to draw its own `ChevronDown` at whatever size
 * suited the spot: 16 on a card, 12 on the details line beneath it, so two
 * disclosures a finger's width apart looked like different kinds of thing.
 * This is the one they share.
 *
 * It turns on the fast spatial spring rather than flipping, and overshoots a
 * little on the way: the Expressive cue that the section is a thing being
 * opened, not a picture being swapped. Reanimated drops the spring for
 * "Remove animations" on its own, and the chevron still ends up pointing the
 * right way — the state is carried by where it ends, not by the movement.
 *
 * Decorative to a screen reader: whatever it sits in owns the tap and says
 * `expanded` itself.
 */
export function ExpandIndicator({ expanded, color }: ExpandIndicatorProps) {
  const colors = useThemeColors();
  const turn = useSharedValue(expanded ? 1 : 0);

  React.useEffect(() => {
    turn.value = withSpring(expanded ? 1 : 0, spatial.fast);
  }, [expanded, turn]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${turn.value * 180}deg` }],
  }));

  return (
    <Animated.View
      style={style}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <ChevronDown size={EXPAND_INDICATOR_SIZE} color={color ?? colors.onSurfaceVariant} />
    </Animated.View>
  );
}
