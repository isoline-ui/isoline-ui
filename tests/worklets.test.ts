/**
 * Every worklet, as it runs on the UI thread: run with
 * `npm run test:worklets`, locally and in CI.
 *
 * A worklet is copied to the UI thread with only what the worklets plugin
 * captured for it (`this.__closure`). Under `node --test` it is still an
 * ordinary function that sees its whole module, so a name the plugin left
 * behind passes every unit test and crashes the app on the first gesture
 * that calls it — as `rubberBand`'s and `loupeCentre`'s defaults did.
 *
 * This compiles each source file with the plugin, takes the code each
 * worklet is sent as, and lists every name that code uses without
 * declaring or capturing it. Only the globals the UI thread has are
 * allowed.
 */
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, relative } from 'node:path';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { transformSync } = require('@babel/core');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const ROOT = join(import.meta.dirname, '..');

/** What the UI thread's runtime has without being given it. */
const UI_GLOBALS = new Set([
  // The language.
  'Array',
  'Boolean',
  'Date',
  'Error',
  'Infinity',
  'JSON',
  'Map',
  'Math',
  'NaN',
  'Number',
  'Object',
  'Promise',
  'RangeError',
  'Set',
  'String',
  'Symbol',
  'TypeError',
  'WeakMap',
  'arguments',
  'console',
  'global',
  'globalThis',
  'isFinite',
  'isNaN',
  'parseFloat',
  'parseInt',
  'undefined',
  // React Native and the worklets runtime.
  '__DEV__',
  '_WORKLET',
  'requestAnimationFrame',
]);

/** A name may be allowed by hand, with the reason, when the runtime has it. */
const ALLOWED = new Map([
  // ['file.tsx:name', 'why the UI thread has it'],
]);

function* sources(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '__tests__' && entry.name !== 'node_modules') yield* sources(path);
    } else if (/\.tsx?$/.test(entry.name)) {
      yield path;
    }
  }
}

/** The code each worklet in a file is sent to the UI thread as. */
function workletCode(path) {
  const code = transformSync(readFileSync(path, 'utf8'), {
    filename: path,
    babelrc: false,
    configFile: false,
    presets: [['@babel/preset-typescript', { isTSX: true, allExtensions: true }]],
    plugins: ['react-native-worklets/plugin'],
  })?.code;
  const sent = [];
  for (const match of (code ?? '').matchAll(
    /_init_data\s*=\s*\{\s*code:\s*("(?:[^"\\]|\\.)*")/g,
  )) {
    sent.push(JSON.parse(match[1]));
  }
  return sent;
}

/** The names a piece of code uses that nothing in it declares. */
function freeNames(code) {
  const ast = parse(code, { sourceType: 'script' });
  const names = new Set();
  traverse(ast, {
    Program(path) {
      for (const name of Object.keys(path.scope.globals)) names.add(name);
    },
  });
  return names;
}

const files = ['packages/react-native/src']
  .flatMap((dir) => [...sources(join(ROOT, dir))])
  .filter((path) => {
    const source = readFileSync(path, 'utf8');
    // Reanimated hooks and gestures also make worklets without a directive.
    // Extracted drawing layers must remain covered by this check.
    return (
      source.includes('worklet') ||
      /from ['"]react-native-(?:reanimated|gesture-handler)['"]/.test(source)
    );
  });

// A plugin update that changed how worklets are sent would make every test
// below pass on nothing.
test('the worklets are found', () => {
  assert.ok(files.length > 0);
  assert.ok(workletCode(join(ROOT, 'packages/react-native/src/sheet-physics.ts')).length >= 3);
});

for (const path of files) {
  const file = relative(ROOT, path);
  test(`every name a worklet in ${file} uses reaches the UI thread`, () => {
    const missing = [];
    for (const code of workletCode(path)) {
      const name = /^\(function (\w*)/.exec(code)?.[1] || '(anonymous)';
      for (const free of freeNames(code)) {
        if (UI_GLOBALS.has(free) || ALLOWED.has(`${file}:${free}`)) continue;
        missing.push(`${name} uses ${free}`);
      }
    }
    assert.deepEqual(missing, []);
  });
}

// Reanimated discovers subscriptions from an updater's own closure. It walks
// arrays and plain objects, but not another worklet's captured closure.
