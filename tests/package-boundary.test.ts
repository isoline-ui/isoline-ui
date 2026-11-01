import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}
test('the shared package imports no app aliases, stores, router or i18n modules', () => {
  for (const path of files(join(root, 'packages/react-native/src'))) {
    const source = readFileSync(path, 'utf8');
    for (const match of source.matchAll(/(?:from|import)\s*['"]([^'"]+)['"]/g)) {
      assert.ok(
        !/^~\/|expo-router|stores\/|db\/|i18n\//.test(match[1]!),
        path + ': ' + match[1],
      );
    }
  }
});
test('React and native runtimes remain peer dependencies', () => {
  const pkg = JSON.parse(
    readFileSync(join(root, 'packages/react-native/package.json'), 'utf8'),
  );
  for (const name of [
    'react',
    'react-native',
    'react-native-reanimated',
    'react-native-gesture-handler',
    'react-native-svg',
  ]) {
    assert.ok(pkg.peerDependencies[name], name);
    assert.ok(!pkg.dependencies[name], name + ' must not install a second native runtime');
  }
});
