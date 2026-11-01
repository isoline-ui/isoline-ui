/**
 * Material 3 Expressive motion physics.
 *
 * Expressive replaced M3's duration-and-easing curves with springs. A spring
 * has no fixed duration: it is described by how hard it pulls (stiffness) and
 * how quickly it stops wobbling (damping ratio), and it re-targets mid-flight
 * instead of restarting. That is what makes an interrupted gesture feel like
 * an object being redirected rather than an animation being cancelled.
 *
 * Two families, and they are not interchangeable:
 *
 * - **Spatial** springs move things — position, size, shape, rotation. They
 *   are under-damped (ratio < 1) so they overshoot slightly and settle back.
 * - **Effects** springs change appearance — color, opacity, elevation. They
 *   are critically damped (ratio = 1), because a colour that overshoots reads
 *   as a flicker, not as weight.
 *
 * The values below are the *expressive* motion scheme. The standard scheme is
 * stiffer and flatter; expressive trades a few milliseconds of settle time for
 * motion you can actually feel. This app uses it everywhere.
 */

export interface SpringToken {
  /** 1 = critically damped (no overshoot); below 1 overshoots and settles. */
  dampingRatio: number;
  stiffness: number;
}

/** Movement: bounds, offset, scale, shape. Slightly under-damped. */
export const spatialTokens = {
  fast: { dampingRatio: 0.6, stiffness: 800 },
  default: { dampingRatio: 0.8, stiffness: 380 },
  slow: { dampingRatio: 0.8, stiffness: 200 },
} as const satisfies Record<string, SpringToken>;

/** Appearance: color, opacity, elevation. Critically damped. */
export const effectsTokens = {
  fast: { dampingRatio: 1, stiffness: 3800 },
  default: { dampingRatio: 1, stiffness: 1600 },
  slow: { dampingRatio: 1, stiffness: 800 },
} as const satisfies Record<string, SpringToken>;

export interface SpringConfig {
  mass: number;
  stiffness: number;
  damping: number;
}

/**
 * Converts an M3 spring token to the physical constants Reanimated wants.
 *
 * M3 specifies a damping *ratio* — dimensionless, and therefore stable across
 * stiffness changes — while Reanimated's physics springs take an absolute
 * damping coefficient. The two are related by `c = 2ζ√(km)`, so a token can be
 * retuned by stiffness alone without accidentally changing its bounciness.
 */
export function springConfig(token: SpringToken, mass = 1): SpringConfig {
  'worklet';
  return {
    mass,
    stiffness: token.stiffness,
    damping: token.dampingRatio * 2 * Math.sqrt(token.stiffness * mass),
  };
}

/** Ready-made configs, so call sites read as `spatial.fast` not as numbers. */
export const spatial = {
  fast: springConfig(spatialTokens.fast),
  default: springConfig(spatialTokens.default),
  slow: springConfig(spatialTokens.slow),
} as const;

export const effects = {
  fast: springConfig(effectsTokens.fast),
  default: springConfig(effectsTokens.default),
  slow: springConfig(effectsTokens.slow),
} as const;

/**
 * Stagger between items in a group that animates in together (FAB menu items,
 * toolbar contents). Expressive sequences items rather than moving them as one
 * block — the offset is what makes a menu feel unfolded instead of pasted on.
 */
export const STAGGER_MS = 28;

/**
 * The stagger to actually use, given the reader's motion preference.
 *
 * Collapses to zero under "Remove animations": a sequence unfolding is the
 * effect itself, and with nothing moving, a delay is only a row arriving late
 * for no visible reason. Here rather than in `~/lib/reduced-motion` so it
 * stays free of Reanimated and testable under `node --test`.
 */
export function staggerFor(reduced: boolean, stagger: number = STAGGER_MS): number {
  return reduced ? 0 : stagger;
}
