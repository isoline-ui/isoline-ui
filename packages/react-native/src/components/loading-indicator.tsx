import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { KEEP_MOTION, useReducedMotion } from '../reduced-motion.ts';
import { useIsolinePlatform, useThemeColors } from '../provider.tsx';
import { blendRadii, radiiToPath, shapeRadii, type ShapeSpec } from '../shape.ts';
import { cn } from '../utils.ts';

/**
 * The Material 3 Expressive loading indicator.
 *
 * Expressive replaced the indeterminate spinner for waits under about five
 * seconds. Instead of a rotating arc it is a single filled shape that turns
 * while morphing through a sequence of polygons — the morph is the signal that
 * something is happening, so it stays legible at sizes where a thin arc turns
 * into a grey smudge.
 *
 * The outline is rebuilt every frame on the UI thread from interpolated radii
 * (see `src/lib/shape.ts`), which is what lets a four-sided shape become a
 * nine-sided one; morphing between two vertex lists of different lengths is
 * not otherwise defined.
 */

/** The shape sequence, chosen so no two neighbours share a corner count. */
const SEQUENCE: ShapeSpec[] = [
  { vertices: 4, roundness: 0.55, rotation: 0 },
  { vertices: 7, roundness: 0.4, rotation: 0.3 },
  { vertices: 5, roundness: 0.5, rotation: 0.6 },
  { vertices: 9, roundness: 0.35, rotation: 0.1 },
  { vertices: 6, roundness: 0.45, rotation: 0.5 },
  { vertices: 8, roundness: 0.4, rotation: 0.2 },
];

/** Sampled once at module load; only the blend runs per frame. */
const RADII = SEQUENCE.map((shape) => shapeRadii(shape));

/** Time on each shape. Slow enough to read as a shape, not as a flicker. */
const MORPH_MS = 650;
/** One full turn. Deliberately not a multiple of the morph, so it never loops
 *  back to an identical frame and start looking like a static image. */
const SPIN_MS = 4600;

const AnimatedPath = Animated.createAnimatedComponent(Path);

export interface LoadingIndicatorProps {
  size?: number;
  color?: string;
  /** Draws the M3 "contained" variant — the shape inside a tonal circle. */
  contained?: boolean;
  className?: string;
  accessibilityLabel?: string;
}

export function LoadingIndicator({
  size = 48,
  color,
  contained = false,
  className,
  accessibilityLabel = 'Loading',
}: LoadingIndicatorProps) {
  const ios = useIsolinePlatform() === 'ios';
  const theme = useThemeColors();
  const resolvedColor = color ?? theme.primary;
  const progress = useSharedValue(0);
  const spin = useSharedValue(0);

  /*
   * A busy indicator keeps moving under "Remove animations", the same way the
   * platform's own does. What the setting is for is motion the reader did not
   * ask for and cannot escape; this is the opposite — it is the answer to
   * "is anything happening", and a spinner frozen mid-turn says the app has
   * hung. The shape-morph is the decorative half of it, and that does stop.
   */
  const reducedMotion = useReducedMotion();

  React.useEffect(() => {
    if (ios) return;
    progress.value = 0;
    if (!reducedMotion) {
      progress.value = withRepeat(
        // Linear across the whole sequence; the per-step easing is applied in
        // the worklet below, so the loop can restart without a seam.
        withTiming(RADII.length, {
          duration: RADII.length * MORPH_MS,
          easing: Easing.linear,
        }),
        -1,
      );
    }

    spin.value = 0;
    spin.value = withRepeat(
      withTiming(360, {
        duration: SPIN_MS,
        easing: Easing.linear,
        reduceMotion: KEEP_MOTION,
      }),
      -1,
    );

    return () => {
      cancelAnimation(progress);
      cancelAnimation(spin);
    };
  }, [ios, progress, reducedMotion, spin]);

  const inset = contained ? size * 0.24 : 0;
  const canvas = size;
  const radius = (size - inset * 2) / 2;

  const animatedProps = useAnimatedProps(() => {
    // Reanimated can briefly publish a non-finite or terminal progress value
    // while a repeating animation is being attached/detached. Normalize it
    // before indexing so a transient frame can never pass undefined radii to
    // the UI-thread worklet.
    const value = Number.isFinite(progress.value) ? progress.value : 0;
    const rawIndex = Math.floor(value);
    const index = ((rawIndex % RADII.length) + RADII.length) % RADII.length;
    const next = (index + 1) % RADII.length;
    const from = RADII[index] ?? RADII[0]!;
    const to = RADII[next] ?? from;

    // Smoothstep the fraction so each shape settles before the next begins,
    // rather than the outline sliding at a constant rate the whole time.
    const t = value - rawIndex;
    const eased = t * t * (3 - 2 * t);

    return {
      d: radiiToPath(blendRadii(from, to, eased), canvas / 2, radius),
    };
  });

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));

  if (ios)
    return (
      <View
        className={className}
        style={{
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: size / 2,
          backgroundColor: contained ? theme.surfaceContainerHigh : 'transparent',
        }}
      >
        <ActivityIndicator
          size={size <= 24 ? 'small' : 'large'}
          color={resolvedColor}
          accessibilityLabel={accessibilityLabel}
        />
      </View>
    );
  return (
    <View
      className={cn('items-center justify-center', contained && 'rounded-full', className)}
      style={{
        width: size,
        height: size,
        backgroundColor: contained ? theme.surfaceContainerHighest : 'transparent',
      }}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View style={spinStyle}>
        <Svg width={canvas} height={canvas}>
          <AnimatedPath animatedProps={animatedProps} fill={resolvedColor} />
        </Svg>
      </Animated.View>
    </View>
  );
}
