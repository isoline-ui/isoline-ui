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
      fs.readFileSync(file, 'utf8').split('\n{/* generated-api:start */}\n')[0].trimEnd(),
      text.split('\n{/* generated-api:start */}\n')[0].trimEnd(),
      `Stale generated example: ${file}; run npm run docs:examples`,
    );
  else {
    const previous = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    const suffix = previous.includes('\n{/* generated-api:start */}\n')
      ? '\n{/* generated-api:start */}\n' + previous.split('\n{/* generated-api:start */}\n')[1]
      : '';
    fs.writeFileSync(
      file,
      suffix
        ? text.split('\n{/* generated-api:start */}\n')[0].trimEnd() + '\n' + suffix
        : text,
    );
  }
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
    const usesMaterialAdapter = ['overlay-materials', 'image-viewer'].includes(entry.story);
    const adapterImport = usesMaterialAdapter
      ? "import { MaterialSurface, MaterialGroup } from '@isoline-ui/native';\n"
      : '';
    const adapterProps = usesMaterialAdapter
      ? ' surfaceComponent={MaterialSurface} surfaceGroupComponent={MaterialGroup}'
      : '';
    const snippet = `import * as React from 'react';\nimport { View, ScrollView } from 'react-native';\nimport { SafeAreaProvider } from 'react-native-safe-area-context';\nimport { GestureHandlerRootView } from 'react-native-gesture-handler';\nimport * as UI from '@isoline-ui/react-native';\n${adapterImport}\ntype StoryProps = { de?: boolean };\n\n${fn}\n\nexport function Example() {\n  return (\n    <GestureHandlerRootView style={{ flex: 1 }}>\n    <SafeAreaProvider>\n      <UI.IsolineProvider theme={UI.themes.violet.light}${adapterProps}>\n        <${stories[entry.story]} de={${de}} />\n      </UI.IsolineProvider>\n    </SafeAreaProvider>\n    </GestureHandlerRootView>\n  );\n}\n`;
    const formattedSnippet = await prettier.format(snippet, {
      ...formatting,
      parser: 'typescript',
      filepath: 'Example.tsx',
    });
    const text = `---\ntitle: '${de ? entry.titleDe : entry.title}'\ndescription: '${(de ? entry.descriptionDe : entry.description).replaceAll("'", "''")}'\n---\n\n<ComponentPreview kind="catalog-${entry.story}" />\n\n${de ? entry.descriptionDe : entry.description}\n\n${(de ? entry.guidanceDe : entry.guidance) ? `## ${de ? 'Verwendung und Zustände' : 'Usage and states'}\n\n${de ? entry.guidanceDe : entry.guidance}\n\n` : ''}## ${de ? 'Vollständiges Beispiel' : 'Complete example'}\n\n${de ? 'Die Demo und dieses Beispiel verwenden dieselbe Implementierung. In einer bestehenden App verwende den vorhandenen Provider weiter.' : 'The demo and this example use the same implementation. Reuse the existing provider when integrating this into an app.'}\n\n\`\`\`tsx title="${entry.title.replaceAll(' ', '')}Example.tsx"\n${formattedSnippet}\`\`\`\n\n## API\n\n${de ? 'Öffentliche Komponenten' : 'Public components'}: ${entry.exports.map((n) => '\`' + n + '\`').join(', ')}.\n\n${de ? 'Prüfe große Schrift, deaktivierte Zustände und VoiceOver/TalkBack im nativen Bildschirm. Browser-Demos ersetzen keine Gerätetests.' : 'Check large text, disabled states and VoiceOver/TalkBack in the native screen. Browser demos do not replace device tests.'}\n`;
    const materialLink =
      entry.props.split(';').includes('material') && entry.slug !== 'overlay-materials'
        ? `\n${de ? 'Glas, solide Alternativen und den Hintergrund vergleichen:' : 'Compare glass, solid fallbacks and backdrop content:'} [${de ? 'Picker und schwebende Materialien' : 'Picker and floating materials'}](/${de ? 'de' : 'en'}/docs/components/overlay-materials).\n`
        : '';
    const adapterNote = usesMaterialAdapter
      ? `\n${de ? 'Das vollständige Beispiel registriert den optionalen Adapter aus `@isoline-ui/native`. Installation, iOS-Voraussetzungen und solide Alternativen:' : 'This complete example registers the optional `@isoline-ui/native` adapter. Installation, iOS requirements and solid fallbacks:'} [${de ? 'Materialien einrichten' : 'Material setup'}](/${de ? 'de' : 'en'}/docs/foundations/materials).\n`
      : '';
    const passwordLink =
      entry.slug === 'input'
        ? `\n${de ? 'Maskierung, Anzeigen/Verbergen und Passwortmanager-Hinweise:' : 'Masking, show/hide and password-manager hints:'} [${de ? 'Passwortfelder' : 'Password inputs'}](/${de ? 'de' : 'en'}/docs/components/password-input).\n`
        : '';
    emit(
      path.join(docs, entry.slug + (de ? '.de' : '') + '.mdx'),
      text + materialLink + adapterNote + passwordLink,
    );
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

// Reference screens are runnable stories, not separately maintained code snippets.
for (const [slug, story, en, deTitle, enDescription, deDescription] of [
  [
    'form-screen',
    'FormScreenExample',
    'Reference form screen',
    'Referenz: Formular',
    'Multiple fields, focus progression, validation, pending submission, server errors and protected dismissal.',
    'Mehrere Felder, Fokuswechsel, Validierung, Absenden, Serverfehler und geschütztes Schließen.',
  ],
  [
    'data-list-screen',
    'DataListScreenExample',
    'Reference data list',
    'Referenz: Datenliste',
    'Search a list and try loading, error, retry, empty and content states.',
    'Liste durchsuchen sowie Laden, Fehler, Wiederholen, Leerzustand und Inhalt ausprobieren.',
  ],
  [
    'settings-screen',
    'SettingsScreenExample',
    'Reference settings screen',
    'Referenz: Einstellungen',
    'Compose grouped switches, radio choices and disclosure content without a router or store.',
    'Gruppierte Schalter, Einfachauswahl und aufklappbare Inhalte ohne Router oder Store zusammensetzen.',
  ],
])
  for (const de of [false, true]) {
    const snippet = await prettier.format(
      `import * as React from 'react';\nimport { View } from 'react-native';\nimport * as UI from '@isoline-ui/react-native';\ntype StoryProps = { de?: boolean };\n${functions.get(story)}\nexport function Example() { return <${story} de={${de}} />; }\n`,
      { ...formatting, parser: 'typescript' },
    );
    emit(
      path.join(root, 'apps/docs/content/docs/guides', slug + (de ? '.de' : '') + '.mdx'),
      `---\ntitle: '${de ? deTitle : en}'\ndescription: '${de ? deDescription : enDescription}'\n---\n\n<ComponentPreview kind="catalog-${slug}" />\n\n${de ? 'Dieses vollständige Beispiel läuft unter deinem vorhandenen IsolineProvider mit Safe-Area- und Gesture-Providern. Daten und Serveraktionen sind bewusst lokale Demonstrationen; ersetze sie durch deine Anwendungsschnittstellen. Die Vorschau erlaubt reproduzierbare Zustandswechsel.' : 'This complete example runs beneath your existing IsolineProvider, safe-area and gesture providers. Data and server actions are local demonstrations; replace them with your application interfaces. The preview exposes repeatable state transitions.'}\n\n## ${de ? 'Vollständiges Beispiel' : 'Complete example'}\n\n\`\`\`tsx\n${snippet}\`\`\`\n\n## ${de ? 'Integration' : 'Integration'}\n\n${de ? 'Render den Bildschirm im scrollbaren Bereich deiner Route. Bei langen Datenlisten ersetze die kleine Beispiel-Liste durch FlatList und behalte Lade-/Fehler-/Leerzustände als ListEmptyComponent. Prüfe Fokus, große Schrift und die letzte Aktion bei geöffneter Tastatur auf iOS und Android. Für einen echten Request verwende Abbruch oder eine Request-ID, damit eine ältere Antwort keinen neueren Zustand überschreibt. Einstellungen sollten erst nach dem erfolgreichen Laden editierbar sein; Speicherung und Fehlerbehandlung bleiben in deiner App.' : 'Render the screen in your route’s scrolling viewport. For long data lists, replace the small example list with FlatList and retain loading/error/empty states in ListEmptyComponent. Verify focus, large text and the final action with the keyboard open on iOS and Android. For real requests, use cancellation or a request ID so an older response cannot overwrite newer state. Keep settings disabled until loaded; persistence and failure handling belong to your app.'}\n`,
    );
  }
