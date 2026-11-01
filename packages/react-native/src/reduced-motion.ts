import { ReduceMotion, useReducedMotion } from 'react-native-reanimated';

/**
 * Honouring "Remove animations".
 *
 * Android's accessibility settings carry a switch that asks the whole system
 * to stop moving things, and people turn it on for reasons that are not about
 * taste: vestibular disorders, migraine, motion sickness, or simply not being
 * able to read a screen that keeps sliding. This app is unusually animated —
 * springs everywhere, a wave travelling along every progress bar — so ignoring
 * that switch is not a small omission.
 *
 * The rule is not "turn every animation off". It is: **motion goes, meaning
 * stays.** Three kinds of animation live in this app and they are treated
 * differently:
 *
 * - **Decoration** — a wave travelling along a bar, a toolbar's items
 *   unfolding one after another, a card springing in. All of this goes.
 * - **Orientation** — a sheet rising from the edge it belongs to, a row
 *   sliding out of a list. The movement goes; the end state arrives at once.
 * - **Information** — the undo bar's countdown, which is the only thing
 *   telling the reader how long they have left to change their mind. This one
 *   *must not* go. Turning it off would not remove a distraction, it would
 *   remove the answer to "how long do I have", and the reader who needs
 *   reduced motion is not a reader who needs less information.
 *
 * Reanimated already defaults its own animations to `ReduceMotion.System`, so
 * most of the first two categories are handled by the platform once
 * `ReducedMotionConfig` states the policy. What this module is for is the
 * third: the places that have to say `ReduceMotion.Never` on purpose, and the
 * places where the app's own decorative loops have to be stopped by hand
 * because Reanimated has no way to know they are decorative.
 */

export { useReducedMotion };

/**
 * For an animation that carries information rather than polish.
 *
 * Spelled out at each call site rather than defaulted, so that opting a piece
 * of motion out of the accessibility setting is a decision somebody made and
 * can be argued with — there should only ever be a handful.
 */
export const KEEP_MOTION = ReduceMotion.Never;

/** For everything else: the platform's answer, whatever it is. */
export const SYSTEM_MOTION = ReduceMotion.System;

/** Re-exported so a call site needs one import, not two. See `~/lib/motion`. */
export { staggerFor } from './motion.ts';
