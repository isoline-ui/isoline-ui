/**
 * Material 3 Expressive shape system.
 *
 * Expressive treats shape as a *state*, not a constant. A component's corners
 * change when it is pressed, selected or busy, and the change is animated by a
 * spatial spring (see `motion.ts`). The two halves of that idea live here:
 *
 * - `corner`, the shape scale every radius in the app is drawn from, so a
 *   round-to-square morph moves between two named steps rather than two magic
 *   numbers;
 * - the polygon helpers, which make a *shape sequence* possible — morphing a
 *   4-sided shape into a 7-sided one, which is how the Expressive loading
 *   indicator is drawn.
 *
 * Everything here is pure maths with no `expo-*` or React imports, so it is
 * covered by `node --test`. The functions used inside animated props are
 * marked `'worklet'` so they can run on the UI thread.
 */

/** The Expressive corner scale, in dp. `full` is a pill, sized at runtime. */
export const corner = {
  none: 0,
  extraSmall: 4,
  small: 8,
  medium: 12,
  large: 16,
  largeIncreased: 20,
  extraLarge: 28,
  extraLargeIncreased: 32,
  extraExtraLarge: 48,
} as const;

/**
 * Number of points a shape is sampled at.
 *
 * Every shape in a morph sequence is resampled to this many points so two
 * shapes with different vertex counts can be interpolated pairwise. 48 is
 * enough that a 9-sided polygon still reads as one, and cheap enough to
 * rebuild every frame on the UI thread.
 */
export const SHAPE_SAMPLES = 48;

/**
 * Samples a regular polygon as a radius per angle.
 *
 * Describing a shape radially — rather than as a vertex list — is what makes
 * shapes with different vertex counts morphable: two radius arrays of equal
 * length always interpolate, whereas two vertex lists of different lengths do
 * not. Radii are normalised so the polygon's corners touch the unit circle.
 */
export function polygonRadii(
  vertices: number,
  samples: number = SHAPE_SAMPLES,
  rotation = 0,
): number[] {
  const step = (Math.PI * 2) / vertices;
  // Centre-to-edge distance. A corner sits at 1, an edge midpoint at `apothem`.
  const apothem = Math.cos(Math.PI / vertices);
  const radii: number[] = [];

  for (let index = 0; index < samples; index += 1) {
    const theta = (index / samples) * Math.PI * 2 + rotation;
    // Angle from the nearest edge midpoint, folded into one polygon segment.
    const local = (((theta % step) + step) % step) - step / 2;
    radii.push(apothem / Math.cos(local));
  }

  return radii;
}

/**
 * Rounds a shape's corners by averaging its radii with their neighbours.
 *
 * A circular moving average over the radial function is a corner rounding:
 * the sharp maxima at the vertices flatten while the edges stay put. `amount`
 * runs 0 (the raw polygon) to 1 (nearly a circle), which is the "roundness"
 * dimension of the Expressive shape library.
 */
export function roundRadii(radii: number[], amount: number): number[] {
  const span = Math.max(0, Math.round((radii.length / 8) * amount));
  if (span === 0) return radii.slice();

  const rounded: number[] = [];
  for (let index = 0; index < radii.length; index += 1) {
    let total = 0;
    for (let offset = -span; offset <= span; offset += 1) {
      total += radii[(index + offset + radii.length * 2) % radii.length]!;
    }
    rounded.push(total / (span * 2 + 1));
  }

  return rounded;
}

/** A shape in a morph sequence: how many corners, how round, how turned. */
export interface ShapeSpec {
  vertices: number;
  roundness: number;
  rotation: number;
}

/** Builds the radius array for a shape, ready to be interpolated. */
export function shapeRadii(shape: ShapeSpec, samples: number = SHAPE_SAMPLES): number[] {
  return roundRadii(polygonRadii(shape.vertices, samples, shape.rotation), shape.roundness);
}

/**
 * A lobed shape: a circle with `lobes` soft bumps around its edge.
 *
 * The scalloped members of the Expressive shape library — the 4-leaf clover,
 * the 9-sided cookie — are not rounded polygons: their edges dip *inward*
 * between the lobes, which averaging a polygon's radii can never produce. A
 * cosine around the circle can. `depth` is how far each dip reaches toward the
 * centre, as a fraction of the radius; the lobes still touch the unit circle.
 */
export function lobedRadii(
  lobes: number,
  depth: number,
  samples: number = SHAPE_SAMPLES,
  rotation = 0,
): number[] {
  const radii: number[] = [];
  for (let index = 0; index < samples; index += 1) {
    const theta = (index / samples) * Math.PI * 2 + rotation;
    radii.push(1 - depth * (0.5 - 0.5 * Math.cos(lobes * theta)));
  }
  return radii;
}

/**
 * Blends two sampled shapes. `t` runs 0 (all `from`) to 1 (all `to`).
 *
 * Runs on the UI thread once per frame, which is why it takes prebuilt arrays
 * rather than `ShapeSpec`s — sampling is done once at module load.
 */
export function blendRadii(from: number[], to: number[], t: number): number[] {
  'worklet';
  const blended: number[] = [];
  for (let index = 0; index < from.length; index += 1) {
    const a = from[index]!;
    const b = to[index] ?? a;
    blended.push(a + (b - a) * t);
  }
  return blended;
}

/**
 * Turns a radius array into a closed SVG path.
 *
 * The points are joined with a Catmull-Rom spline converted to cubic Béziers,
 * so the outline stays smooth as the radii move under it. Drawing straight
 * segments instead would make a morph visibly snap between sample points.
 */
export function radiiToPath(radii: number[], center: number, scale: number): string {
  'worklet';
  const count = radii.length;
  const points: { x: number; y: number }[] = [];

  for (let index = 0; index < count; index += 1) {
    const theta = (index / count) * Math.PI * 2;
    const radius = radii[index]! * scale;
    points.push({ x: center + Math.cos(theta) * radius, y: center + Math.sin(theta) * radius });
  }

  let path = `M${points[0]!.x.toFixed(2)} ${points[0]!.y.toFixed(2)}`;

  for (let index = 0; index < count; index += 1) {
    const previous = points[(index - 1 + count) % count]!;
    const current = points[index]!;
    const next = points[(index + 1) % count]!;
    const after = points[(index + 2) % count]!;

    // Catmull-Rom → Bézier: the control points are a sixth of the way along
    // the chord through each endpoint's neighbours.
    const c1x = current.x + (next.x - previous.x) / 6;
    const c1y = current.y + (next.y - previous.y) / 6;
    const c2x = next.x - (after.x - current.x) / 6;
    const c2y = next.y - (after.y - current.y) / 6;

    path += `C${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
  }

  return `${path}Z`;
}

/**
 * The Expressive wavy progress track.
 *
 * The active half of an Expressive progress indicator is a sine wave rather
 * than a bar: the wave is what distinguishes "working" from "a coloured
 * rectangle" at a glance, and its amplitude can fall to zero to signal that
 * the indicator has settled.
 */
export function wavePath(
  width: number,
  height: number,
  amplitude: number,
  wavelength: number,
  phase: number,
): string {
  'worklet';
  const middle = height / 2;
  if (width <= 0) return `M0 ${middle}`;

  // A sample every 2dp keeps the curve smooth without emitting a path so long
  // it costs more to parse than to draw.
  const steps = Math.max(2, Math.ceil(width / 2));
  let path = '';

  for (let index = 0; index <= steps; index += 1) {
    const x = (index / steps) * width;
    const y = middle + Math.sin((x / wavelength) * Math.PI * 2 + phase) * amplitude;
    path += `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
  }

  return path;
}
