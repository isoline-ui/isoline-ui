/**
 * The arithmetic of a bottom sheet under a finger, kept apart from the views
 * so it can be tested under `node --test`. Every function is a worklet: the
 * pull runs on the UI thread.
 */

/** A pull past this share of the panel's height closes it on release. */
export const CLOSE_SHARE = 0.3;
/** A flick down faster than this (points a second) closes it however short. */
export const CLOSE_VELOCITY = 900;
/** How far a pull up can lift the panel, at most: it gives, but not much. */
export const LIFT_LIMIT = 24;

/** Whether letting go `pull` points below the rest, moving at `velocity`, closes the sheet. */
export function releaseCloses(pull: number, velocity: number, height: number): boolean {
  'worklet';
  if (pull <= 0) return false;
  return pull > height * CLOSE_SHARE || velocity > CLOSE_VELOCITY;
}

/**
 * How far the panel rises for a finger `pull` points up: it follows at first
 * and gives less the further it goes, never more than `limit`. A panel that
 * does not move at all under an upward pull feels stuck rather than anchored.
 */
export function rubberBand(pull: number, limit?: number): number {
  'worklet';
  // Not a default parameter: a worklet unpacks the constants it captured at the
  // top of its body, after the defaults have run, so `limit = LIFT_LIMIT` looks
  // for a global that does not exist on the UI thread and the pull crashes.
  const most = limit ?? LIFT_LIMIT;
  if (pull <= 0) return 0;
  return most * (1 - 1 / ((pull * 0.55) / most + 1));
}

/**
 * How dark the scrim is, 0–1, with the panel `offset` points below its rest:
 * full while it rests (or is lifted), clear once it is all the way down. The
 * scrim follows the panel rather than a clock of its own, so the two arrive
 * and leave together and a pull lightens it as it goes.
 */
export function scrimShare(offset: number, height: number): number {
  'worklet';
  if (height <= 0) return 0;
  return Math.min(1, Math.max(0, 1 - offset / height));
}

/** Where a scrolling list inside a sheet is, as the sheet's pull needs to know it. */
export interface SheetScroll {
  /** How far it is scrolled from its top. */
  y: number;
  /** Whether its content is taller than it is, so that it scrolls at all. */
  scrollable: boolean;
}

/** Whether every list in the sheet is at its top, so a pull down moves the sheet. */
export function listsAtTop(scrolls: Record<string, SheetScroll>): boolean {
  'worklet';
  for (const key of Object.keys(scrolls)) {
    const scroll = scrolls[key];
    if (scroll && scroll.scrollable && scroll.y > 0.5) return false;
  }
  return true;
}

/** Whether a list in the sheet scrolls, so a pull up belongs to it and not to the panel. */
export function anyScrollable(scrolls: Record<string, SheetScroll>): boolean {
  'worklet';
  for (const key of Object.keys(scrolls)) {
    if (scrolls[key]?.scrollable) return true;
  }
  return false;
}
