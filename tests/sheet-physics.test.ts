import assert from 'node:assert/strict';
import test from 'node:test';

import {
  anyScrollable,
  CLOSE_VELOCITY,
  LIFT_LIMIT,
  listsAtTop,
  releaseCloses,
  rubberBand,
  scrimShare,
} from '../packages/react-native/src/sheet-physics.ts';

test('a pull closes past a third of the height, or on a flick down', () => {
  assert.equal(releaseCloses(100, 0, 400), false);
  assert.equal(releaseCloses(130, 0, 400), true);
  assert.equal(releaseCloses(20, CLOSE_VELOCITY + 1, 400), true);
  // A flick down that ends above the rest is not a close.
  assert.equal(releaseCloses(0, CLOSE_VELOCITY * 2, 400), false);
  assert.equal(releaseCloses(-10, CLOSE_VELOCITY * 2, 400), false);
});

test('a pull up gives a little, less the further it goes, never past the limit', () => {
  assert.equal(rubberBand(0), 0);
  assert.equal(rubberBand(-5), 0);
  const near = rubberBand(10);
  const far = rubberBand(200);
  assert.ok(near > 0 && near < 10);
  assert.ok(far > near && far < LIFT_LIMIT);
  assert.ok(rubberBand(1e6) <= LIFT_LIMIT);
});

test('the scrim follows the panel', () => {
  assert.equal(scrimShare(0, 400), 1);
  assert.equal(scrimShare(-12, 400), 1);
  assert.equal(scrimShare(200, 400), 0.5);
  assert.equal(scrimShare(400, 400), 0);
  assert.equal(scrimShare(900, 400), 0);
  // Not measured yet: nothing to dim behind.
  assert.equal(scrimShare(0, 0), 0);
});

test('a pull moves the sheet only while every list is at its top', () => {
  assert.equal(listsAtTop({}), true);
  assert.equal(listsAtTop({ a: { y: 0, scrollable: true } }), true);
  assert.equal(
    listsAtTop({ a: { y: 0, scrollable: true }, b: { y: 40, scrollable: true } }),
    false,
  );
  // A list too short to scroll cannot be scrolled away from its top.
  assert.equal(listsAtTop({ a: { y: 40, scrollable: false } }), true);
  assert.equal(anyScrollable({ a: { y: 0, scrollable: false } }), false);
  assert.equal(
    anyScrollable({ a: { y: 0, scrollable: false }, b: { y: 0, scrollable: true } }),
    true,
  );
});
