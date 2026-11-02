import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as prettier from 'prettier';
import path from 'node:path';
import ts from 'typescript';
const root = path.resolve(import.meta.dirname, '..');
const check = process.argv.includes('--check');
const formatting = await prettier.resolveConfig(
  path.join(root, 'examples/showcase/CatalogExamples.tsx'),
);
function emit(file, text) {
  if (check)
    assert.equal(
      fs.readFileSync(file, 'utf8'),
      text,
      `Stale generated example: ${file}; run npm run docs:examples`,
    );
  else fs.writeFileSync(file, text);
}
const source = fs.readFileSync(
  path.join(root, 'examples/showcase/CatalogExamples.tsx'),
  'utf8',
);
const parsed = ts.createSourceFile(
  'examples.tsx',
  source,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);
const functions = new Map(
  parsed.statements
    .filter(ts.isFunctionDeclaration)
    .map((node) => [node.name.text, node.getText(parsed).replace(/^export /, '')]),
);
const storiesNode = parsed.statements
  .filter(ts.isVariableStatement)
  .flatMap((n) => [...n.declarationList.declarations])
  .find((n) => n.name.getText(parsed) === 'catalogStories');
const stories = Object.fromEntries(
  storiesNode.initializer.properties.map((node) => [node.name.text, node.initializer.text]),
);
const catalog = JSON.parse(
  fs.readFileSync(path.join(root, 'apps/docs/component-catalog.json'), 'utf8'),
);
const docs = path.join(root, 'apps/docs/content/docs/components');
const fixes = {
  'icon-button': 'pressable',
  'menu-sheet': 'menus',
  'select-field': 'menus',
  pressable: 'pressable',
  'layout-motion': 'layout',
  'forms-navigation': 'layout',
  'toolbars-feedback': 'feedback',
  'advanced-sheets': 'advanced-sheet',
};
for (const [slug, story] of Object.entries(fixes))
  for (const de of [false, true]) {
    const file = path.join(docs, slug + (de ? '.de' : '') + '.mdx');
    let text = fs.readFileSync(file, 'utf8');
    if (!text.includes('<ComponentPreview')) {
      const end = text.indexOf('\n---', 4) + 4;
      text =
        text.slice(0, end) +
        `\n\n<ComponentPreview kind="catalog-${story}" />` +
        text.slice(end);
    }
    emit(file, text);
  }
for (const entry of catalog)
  for (const de of [false, true]) {
    const fn = functions.get(stories[entry.story]);
    if (!fn) throw Error(`Missing story ${entry.story}`);
    const snippet = `import * as React from 'react';\nimport { View, ScrollView } from 'react-native';\nimport { SafeAreaProvider } from 'react-native-safe-area-context';\nimport { GestureHandlerRootView } from 'react-native-gesture-handler';\nimport * as UI from '@isoline-ui/react-native';\n\ntype StoryProps = { de?: boolean };\n\n${fn}\n\nexport function Example() {\n  return (\n    <GestureHandlerRootView style={{ flex: 1 }}>\n    <SafeAreaProvider>\n      <UI.IsolineProvider theme={UI.themes.violet.light}>\n        <${stories[entry.story]} de={${de}} />\n      </UI.IsolineProvider>\n    </SafeAreaProvider>\n    </GestureHandlerRootView>\n  );\n}\n`;
    const formattedSnippet = await prettier.format(snippet, {
      ...formatting,
      parser: 'typescript',
      filepath: 'Example.tsx',
    });
    const text = `---\ntitle: '${de ? entry.titleDe : entry.title}'\ndescription: '${(de ? entry.descriptionDe : entry.description).replaceAll("'", "''")}'\n---\n\n<ComponentPreview kind="catalog-${entry.story}" />\n\n${de ? entry.descriptionDe : entry.description}\n\n## ${de ? 'Vollständiges Beispiel' : 'Complete example'}\n\n${de ? 'Die Demo und dieses Beispiel verwenden dieselbe Implementierung. In einer bestehenden App verwende den vorhandenen Provider weiter.' : 'The demo and this example use the same implementation. Reuse the existing provider when integrating this into an app.'}\n\n\`\`\`tsx title="${entry.title.replaceAll(' ', '')}Example.tsx"\n${formattedSnippet}\`\`\`\n\n## API\n\n${de ? 'Öffentliche Komponenten' : 'Public components'}: ${entry.exports.map((n) => '\`' + n + '\`').join(', ')}.\n\n${de ? 'Wichtige Props' : 'Key props'}: ${entry.props
      .split(';')
      .map((n) => '\`' + n + '\`')
      .join(
        ', ',
      )}. ${de ? 'Die exportierten Props-Typen enthalten den vollständigen Vertrag. Beschriftungen und Aktionen werden von der App geliefert.' : 'Exported props types define the full contract. Labels and actions are supplied by the app.'}\n\n${de ? 'Prüfe große Schrift, deaktivierte Zustände und VoiceOver/TalkBack im nativen Bildschirm. Browser-Demos ersetzen keine Gerätetests.' : 'Check large text, disabled states and VoiceOver/TalkBack in the native screen. Browser demos do not replace device tests.'}\n`;
    emit(path.join(docs, entry.slug + (de ? '.de' : '') + '.mdx'), text);
  }
for (const de of [false, true]) {
  const file = path.join(docs, `meta${de ? '.de' : ''}.json`);
  const meta = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const { slug } of catalog) if (!meta.pages.includes(slug)) meta.pages.push(slug);
  emit(file, JSON.stringify(meta, null, 2) + '\n');
}
console.log(
  `${catalog.length} component families generated from ${Object.keys(stories).length} live stories; missing legacy previews restored.`,
);
