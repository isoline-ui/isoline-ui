import assert from 'node:assert/strict';
import test from 'node:test';
import { sheetEdgeLayout } from '../packages/react-native/src/components/sheet-edge-layout.ts';
import { usesPlatformMaterial } from '../packages/react-native/src/material.ts';

test('glass sheets have one continuous material, with no opaque lower overlay', () => {
  const edge = sheetEdgeLayout(true, '#ffffff');
  assert.equal(edge.extension, undefined);
  assert.equal(edge.material.top, 0);
  assert.ok(typeof edge.material.bottom === 'number' && edge.material.bottom < 0);
  assert.equal(edge.material.backgroundColor, undefined);
});

test('safe-area padding stays covered when the sheet is lifted above the window edge', () => {
  const edge = sheetEdgeLayout(true, '#ffffff');
  for (const safeBottom of [0, 21, 34, 59]) {
    const panelHeight = 400 + safeBottom + 16;
    const backgroundBottom = panelHeight - Number(edge.material.bottom);
    for (const lift of [0, 8, 32, 64]) {
      assert.ok(
        backgroundBottom - lift >= panelHeight,
        'material must cover the panel and the exposed edge',
      );
    }
  }
});

test('solid overscroll extensions start below the panel including its bottom padding', () => {
  const edge = sheetEdgeLayout(false, '#202820');
  assert.equal(edge.extension?.backgroundColor, '#202820');
  assert.equal(
    edge.extension?.top,
    undefined,
    'do not use a percentage top inside a padded panel',
  );
  for (const safeBottom of [0, 21, 34, 59]) {
    const panelHeight = 400 + safeBottom + 16;
    const extensionTop =
      panelHeight - Number(edge.extension?.bottom) - Number(edge.extension?.height);
    assert.equal(extensionTop, panelHeight);
  }
});

test('only iOS material requests omit the solid extension; fallback colors remain supplied by the consumer', () => {
  for (const [platform, material] of [
    ['ios', 'solid'],
    ['android', 'auto'],
    ['android', 'glass'],
  ] as const) {
    const edge = sheetEdgeLayout(usesPlatformMaterial(platform, material), '#f8f8f0');
    assert.equal(edge.extension?.backgroundColor, '#f8f8f0');
  }
  for (const material of ['auto', 'glass'] as const) {
    assert.equal(
      sheetEdgeLayout(usesPlatformMaterial('ios', material), '#f8f8f0').extension,
      undefined,
    );
  }
});
