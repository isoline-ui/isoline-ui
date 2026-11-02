import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = path.resolve(import.meta.dirname, '..');
const docs = path.join(root, 'apps/docs/content/docs');
const catalog = JSON.parse(
  fs.readFileSync(path.join(root, 'apps/docs/component-catalog.json'), 'utf8'),
);
const legacy = {
  Button: 'components/button',
  ButtonGroup: 'components/button-group',
  FilterChip: 'components/filter-chip',
  IconButton: 'components/icon-button',
  LoadingIndicator: 'components/loading-indicator',
  TextField: 'components/text-field',
  WavyProgress: 'components/wavy-progress',
  MenuSheet: 'components/menu-sheet',
  MenuSheetRows: 'components/menu-sheet',
  SelectField: 'components/select-field',
  ExpressiveShape: 'components/expressive-shape',
  RowGap: 'components/layout-motion',
  Pressable: 'components/pressable',
  AnimatedPressable: 'components/pressable',
  Switch: 'components/switch',
  Dialog: 'components/dialog',
  DialogActions: 'components/dialog',
  BottomSheet: 'components/bottom-sheet',
  SearchField: 'components/search-field',
  Text: 'components/text',
  ExpandIndicator: 'components/layout-motion',
  Toolbar: 'components/floating-toolbar',
  SplitButton: 'components/floating-actions',
  FabMenu: 'components/floating-actions',
  FloatingActionButton: 'components/floating-actions',
  SheetFrame: 'components/advanced-sheets',
  SheetScrollView: 'components/advanced-sheets',
  PanelSheet: 'components/advanced-sheets',
  TabBar: 'components/tab-bar',
  Popover: 'components/popover',
  ContextMenu: 'components/popover',
  ContextMenuRows: 'components/popover',
  IsolineProvider: 'foundations/provider',
  Surface: 'foundations/materials',
  SurfaceGroup: 'components/surface-group',
  ThemeScope: 'foundations/materials',
};
const coverage = {
  ...legacy,
  ...Object.fromEntries(
    catalog.flatMap((entry) => entry.exports.map((name) => [name, `components/${entry.slug}`])),
  ),
};
const exported = new Set();
const visited = new Set();
function inspect(file) {
  if (visited.has(file)) return;
  visited.add(file);
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  for (const node of source.statements) {
    if (ts.isExportDeclaration(node) && node.moduleSpecifier && !node.exportClause)
      inspect(path.resolve(path.dirname(file), node.moduleSpecifier.text));
    const exportedNode = node.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
    );
    if (!exportedNode) continue;
    if (ts.isFunctionDeclaration(node) && node.name && /^[A-Z][a-z]/.test(node.name.text))
      exported.add(node.name.text);
    if (ts.isVariableStatement(node))
      for (const declaration of node.declarationList.declarations) {
        const name = declaration.name.getText(source);
        if (
          /^[A-Z][a-z]/.test(name) &&
          declaration.initializer &&
          (ts.isCallExpression(declaration.initializer) ||
            ts.isIdentifier(declaration.initializer))
        )
          exported.add(name);
      }
  }
}
inspect(path.join(root, 'packages/react-native/src/index.ts'));
for (const name of exported)
  assert.ok(
    coverage[name],
    `Public component ${name} needs a documented demo in component-catalog.json or the legacy coverage map`,
  );
for (const slug of new Set(Object.values(coverage)))
  for (const suffix of ['.mdx', '.de.mdx']) {
    const file = path.join(docs, slug + suffix);
    assert.ok(fs.existsSync(file), `Missing public component guide: ${file}`);
    const source = fs.readFileSync(file, 'utf8');
    assert.match(source, /<ComponentPreview\b/, `Missing interactive demo: ${file}`);
    assert.match(source, /```tsx\b/, `Missing React Native example: ${file}`);
  }
for (const file of fs
  .readdirSync(path.join(docs, 'components'))
  .filter((file) => file.endsWith('.mdx'))) {
  const source = fs.readFileSync(path.join(docs, 'components', file), 'utf8');
  assert.match(source, /<ComponentPreview\b/, `Component page has no demo: ${file}`);
  assert.match(source, /```tsx\b/, `Component page has no code example: ${file}`);
}
const stories = fs.readFileSync(
  path.join(root, 'examples/showcase/CatalogExamples.tsx'),
  'utf8',
);
for (const entry of catalog)
  assert.match(
    stories,
    new RegExp(`(?:['"]${entry.story}['"]|\\b${entry.story})\\s*:`),
    `Missing runtime story: ${entry.story}`,
  );
console.log(
  `${exported.size} public components mapped to localized examples and interactive previews; every component page has both.`,
);
