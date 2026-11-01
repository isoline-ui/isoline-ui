import * as React from 'react';
import { Dimensions, type ViewStyle, type LayoutChangeEvent } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
  type AnimatedStyle,
} from 'react-native-reanimated';

import { spatial } from '../motion.ts';
import { useReducedMotion } from '../reduced-motion.ts';
import {
  anyScrollable,
  listsAtTop,
  releaseCloses,
  rubberBand,
  scrimShare,
  type SheetScroll,
} from '../sheet-physics.ts';

/** Arrives without overshooting: see `spatialStandard`. */
const SHEET_SPRING = { ...spatial.default, overshootClamping: true };

/** What a `SheetScrollView` needs from the sheet it scrolls in. */
export interface SheetScrollContextValue {
  pull: ReturnType<typeof Gesture.Pan>;
  scrolls: SharedValue<Record<string, SheetScroll>>;
}

/**
 * A bottom sheet's whole life: in, under the finger, and out again.
 *
 * Driven by shared values rather than Reanimated's `entering` layout
 * animations, and that is the point. On Android a layout animation on a view
 * inside a `Modal` leaves the view's *layout* where the animation started even
 * though it is drawn where the animation ended, so presses inside the panel
 * are hit-tested against whatever is behind it — here the scrim, whose one job
 * is to close the panel. A picker built that way looks like it snaps back the
 * instant an option is tapped (software-mansion/react-native-reanimated#4422).
 * An animated transform moves the native view, and Android hit-tests against
 * where the view actually is.
 *
 * The sheet stays `mounted` after `visible` turns false, until the panel has
 * slid out: however it was closed — the scrim, back, a row that acts, a pull —
 * it leaves the way it came. The scrim is not on a clock of its own; it is
 * worked out from where the panel is, so the two always move as one.
 */
export interface Sheet {
  mounted: boolean;
  scrimStyle: AnimatedStyle<ViewStyle>;
  panelStyle: AnimatedStyle<ViewStyle>;
  onPanelLayout: (event: LayoutChangeEvent) => void;
  pull: ReturnType<typeof Gesture.Pan>;
  scrollContext: SheetScrollContextValue;
}
export function useSheet(visible: boolean, onClose: () => void): Sheet {
  /*
   * Under "Remove animations" the panel still travels — it has to, for the
   * hit-testing reason above — but it gets there at once.
   */
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(visible);
  if (visible && !mounted) setMounted(true);

  // How far below its rest the panel is: parked off-screen until it has been
  // measured, so the first frame never shows it before the spring has begun.
  const offset = useSharedValue(Dimensions.get('window').height);
  // How far a finger has moved it on top of that (negative: lifted).
  const drag = useSharedValue(0);
  // The panel's height, 0 until measured.
  const height = useSharedValue(0);
  // Set once a pull has sent the panel on its way out, so the close that
  // follows does not start the leaving over from rest.
  const leaving = useSharedValue(false);
  // Where the finger was when every list reached its top; NaN while a list
  // still has room to scroll back up.
  const anchor = useSharedValue(0);
  const scrolls = useSharedValue<Record<string, SheetScroll>>({});

  // Set by a pull that closed the sheet; the reaction below tells the owner.
  const pulledShut = useSharedValue(false);

  /** Rearms everything for the next time the sheet opens. */
  const rearm = React.useCallback(() => {
    offset.set(Dimensions.get('window').height);
    drag.set(0);
    height.set(0);
    leaving.set(false);
    pulledShut.set(false);
  }, [drag, height, leaving, offset, pulledShut]);

  /** Ends the sheet's life, once the panel is out of sight. */
  const unmount = React.useCallback(() => {
    setMounted(false);
    rearm();
  }, [rearm]);

  // With nothing to watch leave, the sheet is gone as soon as it is closed.
  if (!visible && mounted && reducedMotion) setMounted(false);

  useAnimatedReaction(
    () => pulledShut.value,
    (shut, before) => {
      if (shut && !before) runOnJS(onClose)();
    },
    [onClose],
  );

  React.useEffect(() => {
    if (visible) {
      leaving.set(false);
      pulledShut.set(false);
      // Opened again while it was still leaving: back up from where it is.
      if (height.get() > 0) offset.set(reducedMotion ? 0 : withSpring(0, SHEET_SPRING));
      return;
    }
    if (reducedMotion) {
      rearm();
      return;
    }
    if (!mounted || leaving.get()) return;
    leaving.set(true);
    offset.set(offset.get() + drag.get());
    drag.set(0);
    // Not measured yet, it is still parked off-screen and only has to stop.
    const out = height.get() > 0 ? height.get() : offset.get();
    offset.set(
      withSpring(out, SHEET_SPRING, (finished) => {
        if (finished) runOnJS(unmount)();
      }),
    );
  }, [
    drag,
    height,
    leaving,
    mounted,
    offset,
    pulledShut,
    reducedMotion,
    rearm,
    unmount,
    visible,
  ]);

  /**
   * Starts the slide, once the panel's height is known: the travel is the
   * panel's own height, so it rises from the screen edge rather than flying in
   * from an arbitrary distance. Later layouts only keep the height current.
   */
  const onPanelLayout = React.useCallback(
    (event: LayoutChangeEvent) => {
      const measured = Math.max(1, event.nativeEvent.layout.height);
      const first = height.get() === 0;
      height.set(measured);
      if (!first) return;
      offset.set(measured);
      offset.set(reducedMotion ? 0 : withSpring(0, SHEET_SPRING));
    },
    [height, offset, reducedMotion],
  );

  /*
   * The whole panel takes the pull, as Android's own sheets do: it starts
   * only once a finger has moved, so a tap still reaches the row under it;
   * it gives way to a sideways swipe (a row of chips, a calendar's months);
   * and a list inside scrolls first, handing over to the sheet once it is at
   * its top. Letting go carries the finger's speed into the spring.
   */
  const pull = React.useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-10, 10])
        .failOffsetX([-12, 12])
        .onStart(() => {
          anchor.set(listsAtTop(scrolls.get()) ? 0 : NaN);
        })
        .onUpdate((event) => {
          if (leaving.get()) return;
          if (Number.isNaN(anchor.get())) {
            if (!listsAtTop(scrolls.get())) return;
            anchor.set(event.translationY);
          }
          const moved = event.translationY - anchor.get();
          if (moved >= 0) drag.set(moved);
          else drag.set(anyScrollable(scrolls.get()) ? 0 : -rubberBand(-moved));
        })
        .onFinalize((_event, success) => {
          if (!success && !leaving.get())
            drag.set(reducedMotion ? 0 : withSpring(0, SHEET_SPRING));
        })
        .onEnd((event) => {
          if (leaving.get()) return;
          const pulled = drag.get();
          if (!releaseCloses(pulled, event.velocityY, height.get())) {
            drag.set(withSpring(0, { ...SHEET_SPRING, velocity: event.velocityY }));
            return;
          }
          leaving.set(true);
          offset.set(offset.get() + pulled);
          drag.set(0);
          pulledShut.set(true);
          if (reducedMotion) return;
          offset.set(
            withSpring(
              height.get(),
              { ...SHEET_SPRING, velocity: event.velocityY },
              (finished) => {
                if (finished) runOnJS(unmount)();
              },
            ),
          );
        }),
    [anchor, drag, height, leaving, offset, pulledShut, reducedMotion, scrolls, unmount],
  );

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: scrimShare(offset.value + drag.value, height.value),
  }));
  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value + drag.value }],
  }));

  const scrollContext = React.useMemo<SheetScrollContextValue>(
    () => ({ pull, scrolls }),
    [pull, scrolls],
  );

  return { mounted, scrimStyle, panelStyle, onPanelLayout, pull, scrollContext };
}
