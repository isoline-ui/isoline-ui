import * as React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { lobedRadii, radiiToPath } from '../shape.ts';

/**
 * A still member of the Expressive shape library, with something inside it.
 *
 * Expressive leans on a small set of characterful shapes — the 4-leaf clover,
 * the scalloped cookie — to mark the one thing on a screen worth looking at
 * first: an empty state's symbol, a step in a flow. Drawn from the same radial
 * maths the loading indicator morphs (`~/lib/shape`), so the app's shapes are
 * one family.
 */

const SHAPES = {
  clover: { lobes: 4, depth: 0.22, rotation: Math.PI / 4 },
  cookie: { lobes: 9, depth: 0.1, rotation: 0 },
  flower: { lobes: 6, depth: 0.16, rotation: Math.PI / 6 },
} as const;

export type ExpressiveShapeName = keyof typeof SHAPES;

/** Sampled densely: a still shape is drawn once, so smoothness is free. */
const SAMPLES = 96;

const PATHS = Object.fromEntries(
  Object.entries(SHAPES).map(([name, shape]) => [
    name,
    radiiToPath(lobedRadii(shape.lobes, shape.depth, SAMPLES, shape.rotation), 50, 50),
  ]),
) as Record<ExpressiveShapeName, string>;

export function ExpressiveShape({
  shape,
  size,
  color,
  children,
}: {
  shape: ExpressiveShapeName;
  size: number;
  color: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute' }}>
        <Path d={PATHS[shape]} fill={color} />
      </Svg>
      {children}
    </View>
  );
}
