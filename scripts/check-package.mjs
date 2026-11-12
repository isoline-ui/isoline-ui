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

// The two packages ship as a pair. The native package names the shared one as
// a caret range on the current major, so a minor or patch release needs no
// edit, and the workspace consumers take whatever the workspace links.
const native = JSON.parse(
  readFileSync(new URL('../packages/native/package.json', import.meta.url), 'utf8'),
);
assert.equal(native.version, pkg.version, 'Paired package versions required');
const peer = native.peerDependencies?.[pkg.name];
const [major] = pkg.version.split('.');
assert.equal(
  peer,
  `^${major}.0.0`,
  `${native.name} must peer on ${pkg.name} as ^${major}.0.0, not ${peer}`,
);
for (const workspace of ['examples/showcase', 'apps/docs']) {
  const manifest = new URL(`../${workspace}/package.json`, import.meta.url);
  if (!existsSync(manifest)) continue;
  const { dependencies = {}, devDependencies = {} } = JSON.parse(
    readFileSync(manifest, 'utf8'),
  );
  for (const name of [pkg.name, native.name]) {
    const spec = dependencies[name] ?? devDependencies[name];
    assert.ok(
      spec === undefined || spec === '*',
      `${workspace} must depend on ${name} as "*" (the workspace link), not ${spec}`,
    );
  }
}
console.log(`Paired versions ${pkg.version}; ${native.name} peers on ${peer}.`);

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
