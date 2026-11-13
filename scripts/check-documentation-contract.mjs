import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const ui = JSON.parse(fs.readFileSync(path.join(root, 'packages/react-native/package.json')));
const native = JSON.parse(fs.readFileSync(path.join(root, 'packages/native/package.json')));
assert.equal(ui.version, native.version, 'Documented native/UI archive versions must match');
for (const file of [
  'README.md',
  'packages/react-native/README.md',
  'packages/native/README.md',
  'docs/distribution.md',
  'apps/docs/content/docs/getting-started/installation.mdx',
  'apps/docs/content/docs/getting-started/installation.de.mdx',
]) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  assert.ok(
    text.includes('npm install @isoline-ui/react-native'),
    `${file}: must document installing the npm package`,
  );
  assert.doesNotMatch(
    text,
    /not (?:yet )?(?:a )?published|not an npm release|development source|noch nicht auf npm|keinen veröffentlichten/i,
    `${file}: must not describe the npm release as unpublished`,
  );
  assert.doesNotMatch(
    text,
    /releases\/download\/v0\.1\.0-alpha\.[23]\//,
    `${file}: nonexistent release asset`,
  );
}
console.log(`Documentation installs ${ui.version} from npm with matching UI/native versions.`);
