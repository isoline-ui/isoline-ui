import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const run = (command, args) => execFileSync(command, args, { encoding: 'utf8' }).trim();
const pkg = JSON.parse(readFileSync('packages/react-native/package.json', 'utf8'));
const native = JSON.parse(readFileSync('packages/native/package.json', 'utf8'));
if (pkg.version !== native.version || !/^\d+\.\d+\.\d+-[0-9A-Za-z.-]+$/.test(pkg.version))
  throw new Error('Paired prerelease versions required');
const tag = `v${pkg.version}`;
let existing;
try {
  existing = JSON.parse(run('gh', ['release', 'view', tag, '--json', 'isDraft']));
} catch {}
if (existing && !existing.isDraft) {
  console.log('Published version unchanged.');
  process.exit(0);
}
const directory = process.env.RUNNER_TEMP;
if (!directory || !process.env.GH_REPO) throw new Error('Run in the release workflow');
const packed = JSON.parse(
  run('npm', [
    'pack',
    '--workspace',
    '@isoline-ui/react-native',
    '--workspace',
    '@isoline-ui/native',
    '--pack-destination',
    directory,
    '--json',
  ]),
);
const paths = packed.map((item) => join(directory, item.filename));
const sums = join(directory, 'SHA256SUMS');
writeFileSync(
  sums,
  paths
    .map(
      (path, index) =>
        `${createHash('sha256').update(readFileSync(path)).digest('hex')}  ${packed[index].filename}\n`,
    )
    .join(''),
);
const urls = packed.map(
  (item) =>
    `https://github.com/${process.env.GH_REPO}/releases/download/${tag}/${item.filename}`,
);
const sha = run('git', ['rev-parse', 'HEAD']);
const notes = join(directory, 'release-notes.md');
writeFileSync(
  notes,
  `Isoline UI ${pkg.version}: shared UI, Android Material You system palettes and native iOS Liquid Glass surfaces.\n\nInstall without publishing Isoline to npmjs:\n\n\`\`\`sh\nnpm install ${urls.join(' ')}\nnpx expo install expo-glass-effect\n\`\`\`\n\nUse native peers selected by your Expo SDK (57 or 58). Adding native code requires a new development/app build; an OTA update cannot add it. Preferences remain in the consuming app.\n\nChecked before packing: types, palette tests, declarations, installed scoped tarball autolinking, showcase types and iOS/Android Metro exports. Native compilation and device behavior are separate checks; see docs/native.md.\n\nSource: ${sha}\n\nBoth archives and SHA256SUMS are attached. Published assets are never replaced.\n`,
);
if (existing)
  run('gh', [
    'release',
    'edit',
    tag,
    '--draft=true',
    '--prerelease',
    '--latest=false',
    '--target',
    sha,
    '--notes-file',
    notes,
  ]);
else
  run('gh', [
    'release',
    'create',
    tag,
    '--draft',
    '--prerelease',
    '--latest=false',
    '--target',
    sha,
    '--title',
    `Isoline UI ${pkg.version}`,
    '--notes-file',
    notes,
  ]);
run('gh', ['release', 'upload', tag, ...paths, sums]);
run('gh', ['release', 'edit', tag, '--draft=false', '--prerelease', '--latest=false']);
console.log(`Published ${tag}`);
