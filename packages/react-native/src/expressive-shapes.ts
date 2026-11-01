import { lobedRadii, radiiToPath, shapeRadii } from './shape.ts';

/** Still expressive shapes as SVG paths on a 100-unit box. */

/** Sampled densely: a still shape is drawn once, so smoothness is free. */
const SAMPLES = 96;

export const EXPRESSIVE_SHAPES = {
  clover: radiiToPath(lobedRadii(4, 0.22, SAMPLES, Math.PI / 4), 50, 50),
  cookie: radiiToPath(lobedRadii(9, 0.1, SAMPLES, 0), 50, 50),
  flower: radiiToPath(lobedRadii(6, 0.16, SAMPLES, Math.PI / 6), 50, 50),
  // Pointing up: the angle runs clockwise from three o'clock on screen.
  gable: radiiToPath(
    shapeRadii({ vertices: 5, roundness: 0.55, rotation: Math.PI / 2 }, SAMPLES),
    50,
    52,
  ),
  square: radiiToPath(
    shapeRadii({ vertices: 4, roundness: 0.75, rotation: Math.PI / 4 }, SAMPLES),
    50,
    58,
  ),
} as const;

export type ExpressiveShapeName = keyof typeof EXPRESSIVE_SHAPES;
