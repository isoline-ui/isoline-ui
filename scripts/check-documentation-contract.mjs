import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Holds the release contract: both packages and everything that pins them
 * share one version (scripts/release.mjs writes them together), and the
 * install guides install from npm without naming a version, so a release
 * never has to touch them.
 */
const root = path.resolve(import.meta.dirname, '..');
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const ui = readJson('packages/react-native/package.json');
const native = readJson('packages/native/package.json');
const showcase = readJson('examples/showcase/package.json');

assert.equal(native.version, ui.version, 'Both packages must share one version');
assert.equal(
  native.peerDependencies['@isoline-ui/react-native'],
  ui.version,
  'The native package must peer on the UI package of its own version',
);
for (const name of ['@isoline-ui/react-native', '@isoline-ui/native'])
  assert.equal(
    showcase.dependencies[name],
    ui.version,
    `Showcase must use ${name} ${ui.version}`,
  );

for (const file of [
  'README.md',
  'packages/react-native/README.md',
  'packages/native/README.md',
  'docs/distribution.md',
  'apps/docs/content/docs/getting-started/installation.mdx',
  'apps/docs/content/docs/getting-started/installation.de.mdx',
  'apps/docs/content/docs/native/overview.mdx',
  'apps/docs/content/docs/native/overview.de.mdx',
]) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  assert.match(text, /npm install @isoline-ui\/react-native/, `${file}: install from npm`);
  assert.doesNotMatch(
    text,
    /isoline-ui-(react-)?native-\d[^\s]*\.tgz/,
    `${file}: no local archive`,
  );
  assert.doesNotMatch(
    text,
    /@isoline-ui\/(react-)?native@\d/,
    `${file}: no pinned version; a release must not need doc edits`,
  );
  assert.doesNotMatch(
    text,
    /not (?:yet )?(?:a )?published|not an npm release|development source|noch nicht auf npm|keinen? veröffentlichten?/i,
    `${file}: Isoline is on npm`,
  );
}
console.log(`Packages share ${ui.version}; install guides install from npm without a version.`);
