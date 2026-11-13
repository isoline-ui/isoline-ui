/**
 * Prepares a release: one version for both packages, written everywhere it has
 * to agree, then the checks.
 *
 *   npm run release -- 2.2.0
 *
 * - `packages/react-native` and `packages/native` get the version;
 * - the native package's peer on the UI package, and the showcase's two
 *   dependencies, point at it;
 * - `## Unreleased` at the top of CHANGELOG.md becomes `## <version>`;
 * - the lockfile is regenerated, and `npm run check` and `npm run docs:check`
 *   run.
 *
 * It does not commit, tag or publish: see docs/distribution.md for the rest.
 * Nothing else names a version — the documentation installs from npm — so a
 * release needs no other edits.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const version = process.argv[2];

const fail = (message) => {
  console.error(`release: ${message}`);
  process.exit(1);
};

if (!version || !/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(version)) {
  fail('usage: npm run release -- <version>, for example npm run release -- 2.2.0');
}

const file = (relative) => path.join(root, relative);
const readJson = (relative) => JSON.parse(fs.readFileSync(file(relative), 'utf8'));
const writeJson = (relative, value) =>
  fs.writeFileSync(file(relative), `${JSON.stringify(value, null, 2)}\n`);

const ui = readJson('packages/react-native/package.json');
const native = readJson('packages/native/package.json');
if (ui.version === version) fail(`the packages are already at ${version}`);

// Read and check everything before writing anything, so a refusal leaves the
// tree as it was.
const changelogPath = 'CHANGELOG.md';
const changelog = fs.readFileSync(file(changelogPath), 'utf8');
const unreleased = /^## Unreleased[ \t]*$/m;
if (!unreleased.test(changelog))
  fail(
    'CHANGELOG.md has no "## Unreleased" section to release; describe the changes there first',
  );
const notes = changelog.split(unreleased)[1].split(/^## /m)[0].trim();
if (!notes) fail('the "## Unreleased" section in CHANGELOG.md is empty');
if (new RegExp(`^## ${version.replaceAll('.', '\\.')}\\b`, 'm').test(changelog))
  fail(`CHANGELOG.md already has a ${version} section`);

ui.version = version;
native.version = version;
native.peerDependencies['@isoline-ui/react-native'] = version;
writeJson('packages/react-native/package.json', ui);
writeJson('packages/native/package.json', native);

const showcasePath = 'examples/showcase/package.json';
const showcase = readJson(showcasePath);
for (const name of ['@isoline-ui/react-native', '@isoline-ui/native'])
  if (showcase.dependencies?.[name]) showcase.dependencies[name] = version;
writeJson(showcasePath, showcase);

fs.writeFileSync(file(changelogPath), changelog.replace(unreleased, `## ${version}`));

const run = (command, args) => execFileSync(command, args, { cwd: root, stdio: 'inherit' });
run('npm', ['install', '--package-lock-only', '--ignore-scripts']);
run('npm', ['run', 'check']);
run('npm', ['run', 'docs:check']);

console.log(`
Prepared ${version}. Next:
  git switch -c release-${version}
  git commit -am "chore: release ${version}"
then open a pull request; after it is merged, publish as docs/distribution.md says.`);
