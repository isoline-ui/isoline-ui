import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../packages/react-native/', import.meta.url);
const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
for (const [key, entry] of Object.entries(pkg.exports)) {
  const targets = typeof entry === 'string' ? [entry] : Object.values(entry);
  for (const target of targets)
    assert.ok(existsSync(new URL(target, root)), key + ': ' + target);
}
assert.ok(
  !pkg.scripts?.postinstall,
  'Native apps must not depend on a package postinstall build',
);
assert.ok(pkg.files.includes('src') && pkg.files.includes('dist'));
const motion = readFileSync(new URL('src/motion.ts', root), 'utf8');
assert.ok(motion.includes("'worklet'"), 'Metro source must retain worklet directives');
console.log('Package exports and declaration targets verified; Metro sources retain worklets.');

function declarations(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? declarations(path) : [path];
  });
}
for (const path of declarations(new URL('dist/', root).pathname)) {
  assert.ok(
    !/node_modules\/|types_generated|react-native-reanimated\/lib\//.test(
      readFileSync(path, 'utf8'),
    ),
    'Non-portable declaration: ' + path,
  );
}
