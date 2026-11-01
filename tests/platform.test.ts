import assert from 'node:assert/strict';
import test from 'node:test';
import { resolvePlatform } from '../packages/react-native/src/platform.ts';

test('preview preferences cannot replace the native device platform', () => {
  assert.equal(resolvePlatform('ios', 'android', 'android'), 'ios');
  assert.equal(resolvePlatform('android', 'ios', 'ios'), 'android');
});
test('web supports explicit, inherited and default design preferences', () => {
  assert.equal(resolvePlatform('web', 'ios', 'android'), 'ios');
  assert.equal(resolvePlatform('web', undefined, 'ios'), 'ios');
  assert.equal(resolvePlatform('web'), 'android');
});
