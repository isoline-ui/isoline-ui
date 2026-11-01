import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  blendRadii,
  lobedRadii,
  polygonRadii,
  radiiToPath,
  roundRadii,
  shapeRadii,
  wavePath,
  SHAPE_SAMPLES,
} from '../packages/react-native/src/shape.ts';

describe('polygonRadii', () => {
  it('touches the unit circle at the corners and pulls in at the edges', () => {
    // Unrotated, sample zero sits on a corner, so four samples of a square
    // land on all four of them.
    for (const radius of polygonRadii(4, 4, 0)) {
      assert.ok(Math.abs(radius - 1) < 1e-9, `corner radius ${radius}`);
    }

    // Half a segment of rotation moves the same samples to the edge midpoints.
    for (const radius of polygonRadii(4, 4, Math.PI / 4)) {
      assert.ok(Math.abs(radius - Math.cos(Math.PI / 4)) < 1e-9, `edge radius ${radius}`);
    }
  });

  it('approaches a circle as vertices increase', () => {
    const spread = (vertices: number) => {
      const radii = polygonRadii(vertices, 64);
      return Math.max(...radii) - Math.min(...radii);
    };

    assert.ok(spread(24) < spread(4));
  });

  it('never leaves the unit circle, whatever the rotation', () => {
    for (const rotation of [0, 0.3, 1.1, Math.PI, -2]) {
      for (const radius of polygonRadii(7, SHAPE_SAMPLES, rotation)) {
        assert.ok(radius <= 1 + 1e-9 && radius > 0, `radius ${radius}`);
      }
    }
  });
});

describe('roundRadii', () => {
  it('leaves a shape untouched at zero', () => {
    const radii = polygonRadii(6);
    assert.deepEqual(roundRadii(radii, 0), radii);
  });

  it('flattens the corners as roundness rises', () => {
    const radii = polygonRadii(5);
    const spread = (amount: number) => {
      const rounded = roundRadii(radii, amount);
      return Math.max(...rounded) - Math.min(...rounded);
    };

    assert.ok(spread(1) < spread(0.5));
    assert.ok(spread(0.5) < spread(0));
  });

  it('keeps the sample count so rounded shapes stay interpolable', () => {
    assert.equal(roundRadii(polygonRadii(9), 0.8).length, SHAPE_SAMPLES);
  });
});

describe('blendRadii', () => {
  it('returns each end of the morph exactly', () => {
    const from = shapeRadii({ vertices: 4, roundness: 0.4, rotation: 0 });
    const to = shapeRadii({ vertices: 7, roundness: 0.4, rotation: 0.2 });

    assert.deepEqual(blendRadii(from, to, 0), from);
    assert.deepEqual(blendRadii(from, to, 1), to);
  });

  it('lands halfway at the midpoint', () => {
    assert.deepEqual(blendRadii([1, 0], [0, 1], 0.5), [0.5, 0.5]);
  });
});

describe('radiiToPath', () => {
  it('emits a closed cubic path with one curve per sample', () => {
    const path = radiiToPath([1, 1, 1, 1], 12, 10);

    assert.match(path, /^M/);
    assert.match(path, /Z$/);
    assert.equal(path.split('C').length - 1, 4);
  });

  it('stays inside the circle the shape is scaled to', () => {
    const center = 24;
    const scale = 20;
    const path = radiiToPath(
      shapeRadii({ vertices: 5, roundness: 0.6, rotation: 0 }),
      center,
      scale,
    );

    for (const value of path.match(/-?\d+\.\d+/g) ?? []) {
      const distance = Math.abs(Number(value) - center);
      assert.ok(distance <= scale + 1e-6, `${value} escaped the bounds`);
    }
  });
});

describe('wavePath', () => {
  it('oscillates around the middle of the track', () => {
    const height = 8;
    const path = wavePath(100, height, 3, 25, 0);
    const ys = (path.match(/[ML][\d.]+ ([\d.]+)/g) ?? []).map((chunk) =>
      Number(chunk.split(' ')[1]),
    );

    assert.ok(Math.max(...ys) <= height / 2 + 3 + 1e-6);
    assert.ok(Math.min(...ys) >= height / 2 - 3 - 1e-6);
  });

  it('flattens to a straight line at zero amplitude', () => {
    const path = wavePath(60, 10, 0, 20, 1.2);
    assert.ok(path.split('L').every((chunk) => chunk.includes('5.00')));
  });

  it('degenerates to a single point at zero width', () => {
    assert.equal(wavePath(0, 6, 2, 10, 0), 'M0 3');
  });
});

describe('lobedRadii', () => {
  it('peaks on the unit circle and dips by its depth between lobes', () => {
    // Four lobes sampled eight times: peaks at even samples, dips at odd ones.
    const radii = lobedRadii(4, 0.2, 8);
    radii.forEach((radius, index) => {
      const expected = index % 2 === 0 ? 1 : 0.8;
      assert.ok(Math.abs(radius - expected) < 1e-9, `sample ${index}: ${radius}`);
    });
  });

  it('is a circle at zero depth', () => {
    for (const radius of lobedRadii(9, 0)) assert.equal(radius, 1);
    assert.equal(lobedRadii(9, 0.1).length, SHAPE_SAMPLES);
  });
});
