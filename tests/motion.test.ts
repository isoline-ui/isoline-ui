import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  effects,
  spatial,
  springConfig,
  spatialTokens,
} from '../packages/react-native/src/motion.ts';

describe('springConfig', () => {
  it('turns a damping ratio into the matching damping coefficient', () => {
    // c = 2ζ√(km): ratio 1 at stiffness 400 with unit mass is 2·1·20.
    assert.equal(springConfig({ dampingRatio: 1, stiffness: 400 }).damping, 40);
  });

  it('scales damping with mass so bounciness survives a heavier target', () => {
    const light = springConfig({ dampingRatio: 0.5, stiffness: 100 }, 1);
    const heavy = springConfig({ dampingRatio: 0.5, stiffness: 100 }, 4);
    assert.equal(heavy.damping / light.damping, 2);
  });
});

describe('motion tokens', () => {
  it('leaves spatial springs under-damped so movement overshoots', () => {
    for (const token of Object.values(spatialTokens)) {
      assert.ok(token.dampingRatio < 1, `${token.dampingRatio} should overshoot`);
    }
  });

  it('keeps effects springs critically damped so colour never flickers', () => {
    for (const config of Object.values(effects)) {
      assert.equal(config.damping, 2 * Math.sqrt(config.stiffness));
    }
  });

  it('orders spatial springs fast to slow by stiffness', () => {
    assert.ok(spatial.fast.stiffness > spatial.default.stiffness);
    assert.ok(spatial.default.stiffness > spatial.slow.stiffness);
  });
});
