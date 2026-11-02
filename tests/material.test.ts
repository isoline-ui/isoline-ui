import assert from 'node:assert/strict';
import test from 'node:test';
import { usesPlatformMaterial } from '../packages/react-native/src/material.ts';
import { placePopover } from '../packages/react-native/src/components/popover-layout.ts';
test('material requests preserve solid defaults and Android presentation', () => {
  assert.equal(usesPlatformMaterial('ios'), false);
  assert.equal(usesPlatformMaterial('ios', 'solid'), false);
  assert.equal(usesPlatformMaterial('ios', 'auto'), true);
  assert.equal(usesPlatformMaterial('ios', 'glass'), true);
  assert.equal(usesPlatformMaterial('android', 'glass'), false);
  assert.equal(usesPlatformMaterial('android', 'auto'), false);
});
test('anchored menu flips above an action near the bottom', () => {
  const box = placePopover(
    { x: 290, y: 740, width: 60, height: 44 },
    { width: 300, height: 220 },
    { width: 390, height: 844, top: 44, bottom: 34 },
  );
  assert.equal(box.placement, 'top');
  assert.equal(box.top, 512);
  assert.ok(box.left >= 12);
  assert.ok(box.left + box.width <= 378);
});
test('popover clamps long content and safe-area edges in a narrow viewport', () => {
  const box = placePopover(
    { x: -30, y: 10, width: 20, height: 10 },
    { width: 500, height: 900 },
    { width: 320, height: 240, left: 8, right: 8, top: 24, bottom: 20 },
  );
  assert.equal(box.width, 280);
  assert.equal(box.left, 20);
  assert.equal(box.maxHeight, 172);
  assert.ok(box.top >= 36);
  assert.ok(box.top + Math.min(900, box.maxHeight) <= 208);
});
test('preferred placement flips down when there is no room above', () => {
  const box = placePopover(
    { x: 40, y: 36, width: 50, height: 40 },
    { width: 200, height: 120 },
    { width: 360, height: 640, top: 24 },
    'top',
  );
  assert.equal(box.placement, 'bottom');
  assert.equal(box.top, 84);
});
