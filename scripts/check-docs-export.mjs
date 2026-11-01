import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '../apps/docs/out');
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '/isoline-ui';
function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(path.join(directory, e.name)) : [path.join(directory, e.name)],
  );
}
const html = files(root).filter((file) => file.endsWith('.html'));
let links = 0;
for (const file of html) {
  const source = readFileSync(file, 'utf8');
  const german = path.relative(root, file).startsWith('de/');
  assert.match(source, german ? /<html[^>]*lang="de"/ : /<html[^>]*lang="en"/);
  for (const match of source.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)) {
    const href = match[1].replaceAll('&amp;', '&');
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    assert.ok(
      href === base || href.startsWith(base + '/'),
      `Missing Pages base path in ${href} (${file})`,
    );
    const relative = decodeURIComponent(href.slice(base.length).split('?')[0]);
    const target = path.join(root, relative);
    assert.ok(
      existsSync(target) || existsSync(path.join(target, 'index.html')),
      `Missing exported target ${href} (${file})`,
    );
    links++;
  }
}
assert.ok(html.length >= 77, 'All localized documentation and home routes must be exported');
const search = JSON.parse(readFileSync(path.join(root, 'search-index.json'), 'utf8'));
assert.ok(search && typeof search === 'object', 'A static JSON search index is required');
assert.ok(existsSync(path.join(root, 'sitemap.xml')));
console.log(
  `Static export verified: ${html.length} HTML pages, ${links} local links/assets, static search and sitemap.`,
);
