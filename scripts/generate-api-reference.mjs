import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import ts from 'typescript';
const root = path.resolve(import.meta.dirname, '..');
const check = process.argv.includes('--check');
const entry = path.join(root, 'packages/react-native/src/index.ts');
const config = ts.readConfigFile(
  path.join(root, 'packages/react-native/tsconfig.json'),
  ts.sys.readFile,
);
const options = ts.parseJsonConfigFileContent(
  config.config,
  ts.sys,
  path.dirname(path.dirname(entry)),
);
const program = ts.createProgram([entry], options.options);
const checker = program.getTypeChecker();
const source = program.getSourceFile(entry);
const exports = checker.getExportsOfModule(checker.getSymbolAtLocation(source));
const catalog = JSON.parse(
  fs.readFileSync(path.join(root, 'apps/docs/component-catalog.json')),
);
const legacy = Object.fromEntries(
  Object.entries(
    JSON.parse(fs.readFileSync(path.join(root, 'apps/docs/component-pages.json'), 'utf8')),
  )
    .filter(([, slug]) => slug.startsWith('components/'))
    .map(([name, slug]) => [name, slug.slice(11)]),
);
const pages = new Map();
for (const [name, slug] of Object.entries(legacy))
  pages.set(slug, [...(pages.get(slug) ?? []), name]);
for (const item of catalog)
  pages.set(item.slug, [...new Set([...(pages.get(item.slug) ?? []), ...item.exports])]);
// Related hand-written guides also get the full contracts they describe.
for (const [slug, names] of Object.entries({
  'material-controls': ['Button', 'IconButton', 'SelectField'],
  'password-input': ['Input', 'TextField'],
  'overlay-materials': ['DateField', 'ColorPickerSheet'],
  'navigation-bars': ['NavigationBar', 'TopBar'],
  'toolbars-feedback': ['Toolbar', 'Snackbar'],
  'forms-navigation': ['Input', 'TopBar', 'SettingsNavRow'],
  'advanced-sheets': ['SheetFrame', 'SheetScrollView', 'PanelSheet'],
}))
  pages.set(slug, [...new Set([...(pages.get(slug) ?? []), ...names])]);
const marker = '\n{/* generated-api:start */}\n';
const cell = (value) =>
  String(value).replaceAll('|', '\\|').replaceAll('\n', ' ').replaceAll('`', "'");
function contract(name, de) {
  const exported = exports.find((s) => s.name === name);
  if (!exported) throw Error(`Missing public export ${name}`);
  const symbol =
    exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
  const decl = symbol.valueDeclaration ?? symbol.declarations?.[0];
  const type = checker.getTypeOfSymbolAtLocation(symbol, decl);
  const signature = type.getCallSignatures()[0];
  if (!signature?.parameters[0]) return '';
  const props = checker.getTypeOfSymbolAtLocation(signature.parameters[0], decl);
  const properties = props.getProperties();
  const defaults = new Map();
  const scan = (node) => {
    if (ts.isBindingElement(node) && node.initializer)
      defaults.set(node.name.getText(), node.initializer.getText());
    ts.forEachChild(node, scan);
  };
  // Restrict defaults to the component function, including forwardRef wrappers.
  scan(decl);
  let inherited = false;
  const rows = properties.flatMap((prop) => {
    const declaration = prop.valueDeclaration ?? prop.declarations?.[0];
    if (!declaration) return [];
    const filename = declaration.getSourceFile().fileName;
    if (!filename.includes('/packages/react-native/src/')) {
      inherited = true;
      return [];
    }
    const type = declaration.type
      ? declaration.type.getText()
      : checker.typeToString(
          checker.getTypeOfSymbolAtLocation(prop, declaration),
          declaration,
          ts.TypeFormatFlags.NoTruncation,
        );
    const description = ts.displayPartsToString(prop.getDocumentationComment(checker));
    const optional = Boolean(prop.flags & ts.SymbolFlags.Optional);
    return [
      `| \`${cell(prop.name)}\` | \`${cell(type)}\` | ${optional ? 'optional' : de ? 'ja' : 'yes'} | ${defaults.has(prop.name) ? '\`' + cell(defaults.get(prop.name)) + '\`' : '—'} | ${cell(description) || '—'} |`,
    ];
  });
  return `\n### ${name}\n\n| Prop | ${de ? 'Typ' : 'Type'} | ${de ? 'Pflicht' : 'Required'} | Default | ${de ? 'Verhalten' : 'Behavior'} |\n| --- | --- | --- | --- | --- |\n${rows.join('\n')}\n\n${inherited ? (de ? 'Zusätzlich gelten die geerbten React-Native-Props des angegebenen Basistyps (z. B. View, Pressable oder TextInput) und gegebenenfalls React-Ref-Attribute. Eigene Props und Materialoptionen stehen vollständig in der Tabelle.' : 'Also accepts inherited React Native props from its declared base type (for example View, Pressable or TextInput), and React ref attributes where applicable. All Isoline-specific props and material options are listed above.') + '\n\n' : ''}[${de ? 'Typdefinition und Implementierung' : 'Type definition and implementation'}](https://github.com/isoline-ui/isoline-ui/blob/main/${path.relative(root, decl.getSourceFile().fileName)})\n`;
}
for (const [slug, names] of pages)
  for (const de of [false, true]) {
    const file = path.join(
      root,
      'apps/docs/content/docs/components',
      slug + (de ? '.de' : '') + '.mdx',
    );
    let body = fs.readFileSync(file, 'utf8').split(marker)[0].trimEnd();
    const generated =
      marker +
      `\n## ${de ? 'Vollständige Props-Referenz' : 'Complete props reference'}\n\n${de ? 'Aus der öffentlichen TypeScript-API erzeugt; CI prüft diese Tabellen auf Änderungen. „—“ bedeutet: kein expliziter Default in der Komponentenfunktion. Die Abschnitte darüber erklären Anwendungsfälle und zustandsabhängiges Verhalten.' : 'Generated from the public TypeScript API; CI checks these tables for drift. “—” means no explicit default in the component function. The sections above explain use cases and state-dependent behavior.'}\n` +
      names.map((name) => contract(name, de)).join('') +
      '\n{/* generated-api:end */}\n';
    const expected = body + '\n' + generated;
    if (check)
      assert.equal(fs.readFileSync(file, 'utf8'), expected, `Stale API reference: ${file}`);
    else fs.writeFileSync(file, expected);
  }
console.log(`${pages.size} component guides have localized source-derived props references.`);
