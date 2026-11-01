import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '/isoline-ui';
execFileSync('npm', ['run', 'export:web', '--workspace', 'isoline-showcase'], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, EXPO_BASE_URL: `${base}/previews`, EXPO_NO_TELEMETRY: '1' },
});
const target = path.join(root, 'apps/docs/public/previews');
rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(path.join(root, 'examples/showcase/dist/web'), target, { recursive: true });
