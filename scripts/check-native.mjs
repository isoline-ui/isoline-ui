import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const temporary = mkdtempSync(join(tmpdir(), 'isoline-scoped-native-'));
const run = (program, args, cwd = root) =>
  execFileSync(program, args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1', npm_config_cache: join(temporary, 'cache') },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
try {
  const packed = JSON.parse(
    run('npm', [
      'pack',
      '--workspace',
      '@isoline-ui/native',
      '--pack-destination',
      temporary,
      '--json',
    ]),
  );
  const archive = join(temporary, packed[0].filename);
  for (const path of [
    'expo-module.config.json',
    'android/build.gradle',
    'android/src/main/java/isoline/modules/systemcolors/IsolineSystemColorsModule.kt',
    'src/MaterialSurface.ios.tsx',
    'dist/index.d.ts',
  ]) {
    assert.ok(
      packed[0].files.some((file) => file.path === path),
      `Native archive missing ${path}`,
    );
  }
  writeFileSync(
    join(temporary, 'package.json'),
    JSON.stringify({
      name: 'isoline-autolinking-test',
      private: true,
      dependencies: { '@isoline-ui/native': `file:${archive}` },
    }),
  );
  // No peer installation or network needed: test the real native archive in node_modules.
  run(
    'npm',
    [
      'install',
      '--offline',
      '--ignore-scripts',
      '--legacy-peer-deps',
      '--no-audit',
      '--no-fund',
      '--cache',
      join(temporary, 'cache'),
    ],
    temporary,
  );
  const cli = join(
    root,
    'node_modules/expo-modules-autolinking/bin/expo-modules-autolinking.js',
  );
  const android = JSON.parse(
    run(
      process.execPath,
      [cli, 'resolve', '--platform', 'android', '--project-root', temporary, '--json'],
      temporary,
    ),
  );
  const module = android.modules.find((item) => item.packageName === '@isoline-ui/native');
  assert.ok(module, 'Scoped native package must be autolinked from the installed archive');
  assert.ok(module.projects.some((project) => project.name === 'isoline-ui-native'));
  assert.ok(
    module.projects.some((project) =>
      project.modules.some(
        (entry) =>
          (typeof entry === 'string' ? entry : entry.classifier) ===
          'isoline.modules.systemcolors.IsolineSystemColorsModule',
      ),
    ),
  );
  for (const project of module.projects)
    assert.ok(existsSync(join(project.sourceDir, 'build.gradle')));
  const apple = JSON.parse(
    run(
      process.execPath,
      [cli, 'resolve', '--platform', 'apple', '--project-root', temporary, '--json'],
      temporary,
    ),
  );
  assert.ok(
    !apple.modules.some((item) => item.packageName === '@isoline-ui/native'),
    'The Android-only bridge must not be linked on iOS',
  );
  console.log(
    'Installed @isoline-ui/native tarball: Android autolinking and iOS exclusion passed.',
  );
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
