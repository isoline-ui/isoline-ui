import * as React from 'react';
import { Dimensions, type LayoutChangeEvent } from 'react-native';
import {
  type AnimatedStyle,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { spatial } from '../motion.ts';
import { useReducedMotion } from '../reduced-motion.ts';

/** How long the scrim takes to dim — the same 120ms the sheets faded in over before. */
const SCRIM_FADE_MS = 120;

/**
 * The open transition for a panel presented inside a `Modal`: the scrim dims,
 * and the panel springs up from the edge it is anchored to.
 *
 * Driven by shared values rather than Reanimated's `entering` layout
 * animations, and that is the entire point of this hook. On Android a layout
 * animation on a view inside a `Modal` leaves the view's *layout* where the
 * animation started even though the view is drawn where the animation ended,
 * so presses inside the panel are hit-tested against whatever is behind it —
 * here the scrim, whose one job is to close the panel. A picker built that way
 * looks like it snaps back the instant an option is tapped: the tap closed the
 * sheet and never reached the row it landed on. Only Android is affected, and
 * only inside a `Modal`, which is why it survived review twice
 * (software-mansion/react-native-reanimated#4422).
 *
 * An animated transform has no such problem: it moves the native view, and
 * Android hit-tests against where the view actually is.
 */
export interface SheetTransition {
  scrimStyle: AnimatedStyle<{ opacity: number }>;
  panelStyle: AnimatedStyle<{ transform: { translateY: number }[] }>;
  onPanelLayout: (event: LayoutChangeEvent) => void;
  drag: SharedValue<number>;
  height: SharedValue<number>;
  reducedMotion: boolean;
}

export function useSheetTransition(visible: boolean): SheetTransition {
  /*
   * Under "Remove animations" the panel still travels — it has to, for the
   * hit-testing reason above — but it gets there at once. The scrim stops
   * fading for the same reason: a sheet appearing is orientation, not
   * decoration, and the reader still needs to see where it came from. What
   * they no longer get is the journey.
   */
  const reducedMotion = useReducedMotion();
  const dim = useSharedValue(0);
  // Parked off-screen until the panel has been measured, so the first frame
  // never shows it at its resting place before the spring has begun.
  const offset = useSharedValue(Dimensions.get('window').height);
  // How far a finger has pulled the panel down from where it rests, and the
  // panel's height to weigh that against — the scrim lightens as it goes.
  const drag = useSharedValue(0);
  const height = useSharedValue(1);
  const measured = React.useRef(false);

  React.useEffect(() => {
    if (visible) {
      dim.value = reducedMotion ? 1 : withTiming(1, { duration: SCRIM_FADE_MS });
      return;
    }

    // `Modal` unmounts its children as it hides, so there is nothing left to
    // animate out — this only rearms the transition for the next open.
    measured.current = false;
    dim.value = 0;
    drag.value = 0;
    offset.value = Dimensions.get('window').height;
  }, [dim, drag, offset, reducedMotion, visible]);

  /**
   * Starts the slide, once the panel's height is known: the travel is the
   * panel's own height, so it rises from the screen edge rather than flying in
   * from an arbitrary distance.
   */
  const onPanelLayout = React.useCallback(
    (event: LayoutChangeEvent) => {
      // Keyboard and window-size changes also change the dismiss distance.
      height.set(Math.max(1, event.nativeEvent.layout.height));
      if (measured.current) return;
      measured.current = true;
      offset.set(event.nativeEvent.layout.height);
      offset.set(reducedMotion ? 0 : withSpring(0, spatial.default));
    },
    [height, offset, reducedMotion],
  );

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: dim.value * (1 - Math.min(1, drag.value / height.value)),
  }));
  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value + drag.value }],
  }));

  return { scrimStyle, panelStyle, onPanelLayout, drag, height, reducedMotion };
}
