import * as React from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { spatial } from '../motion.ts';
import { useReducedMotion } from '../reduced-motion.ts';
import { useIsolinePlatform, useThemeColors } from '../provider.tsx';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const STROKE = 4;
const WAVELENGTH = 28;
/** Room above and below the line for the wave to swing in. */
const HEIGHT = 12;
const GAP = 6;

/**
 * The Expressive determinate progress indicator: the part done is a wave,
 * the part left a flat track, with a gap between them.
 *
 * The wave calms down towards either end — it is flat at nothing done and
 * flat again at all done, so a finished list reads as finished, not busy.
 * While something is underway the wave travels slowly; under "Remove
 * animations" it stands still, and a change of progress arrives at once.
 */
export function WavyProgress({
  progress,
  color,
  trackColor,
  animated = true,
}: {
  /** 0 to 1. */
  progress: number;
  color?: string;
  trackColor?: string;
  /** A still wave, for small previews where motion would only distract. */
  animated?: boolean;
}) {
  const ios = useIsolinePlatform() === 'ios';
  const colors = useThemeColors();
  const reduced = useReducedMotion();
  const [width, setWidth] = React.useState(0);
  const value = useSharedValue(progress);
  const phase = useSharedValue(0);
  const moving = animated && !reduced && !ios;

  React.useEffect(() => {
    value.value = moving ? withSpring(progress, spatial.slow) : progress;
  }, [moving, progress, value]);

  React.useEffect(() => {
    if (!moving) {
      cancelAnimation(phase);
      return;
    }
    phase.value = 0;
    phase.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.linear }), -1);
    return () => cancelAnimation(phase);
  }, [moving, phase]);

  const wave = useAnimatedProps(() => {
    const p = Math.max(0, Math.min(1, value.value));
    const end = Math.max(0, (width - STROKE) * p);
    const amplitude = (ios ? 0 : 3) * Math.min(1, p * 6, (1 - p) * 6);
    const mid = HEIGHT / 2;
    const shift = phase.value * WAVELENGTH;
    let d = `M ${STROKE / 2} ${mid}`;
    for (let x = 2; x <= end; x += 2) {
      const y = mid + amplitude * Math.sin(((x + shift) / WAVELENGTH) * 2 * Math.PI);
      d += ` L ${x + STROKE / 2} ${y.toFixed(2)}`;
    }
    return { d, strokeOpacity: end < 1 ? 0 : 1 };
  });

  const track = useAnimatedProps(() => {
    const p = Math.max(0, Math.min(1, value.value));
    const start = (width - STROKE) * p + (p > 0 ? GAP : 0) + STROKE / 2;
    const end = width - STROKE / 2;
    return {
      d: `M ${Math.min(start, end)} ${HEIGHT / 2} L ${end} ${HEIGHT / 2}`,
      strokeOpacity: start >= end ? 0 : 1,
    };
  });

  return (
    <View
      style={{ height: HEIGHT }}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
    >
      {width > 0 ? (
        <Svg width={width} height={HEIGHT}>
          <AnimatedPath
            animatedProps={track}
            stroke={trackColor ?? colors.secondaryContainer}
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
          />
          <AnimatedPath
            animatedProps={wave}
            stroke={color ?? colors.primary}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      ) : null}
    </View>
  );
}
