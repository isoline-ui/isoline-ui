import * as React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

/**
 * A still member of the Expressive shape library, with something inside it.
 *
 * Expressive leans on a small set of characterful shapes — the 4-leaf clover,
 * the scalloped cookie — to mark the one thing on a screen worth looking at
 * first: an empty state's symbol, a step in a flow. Drawn from the same radial
 * maths the loading indicator morphs (`~/lib/shape`), so the app's shapes are
 * one family.
 */

export { type ExpressiveShapeName } from '../expressive-shapes.ts';
import { EXPRESSIVE_SHAPES as PATHS, type ExpressiveShapeName } from '../expressive-shapes.ts';

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
