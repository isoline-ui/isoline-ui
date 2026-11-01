import assert from 'node:assert/strict';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const root = path.resolve(import.meta.dirname, '..');
const docs = path.join(root, 'apps/docs/content/docs');
const files = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? files(path.join(directory, entry.name))
      : [path.join(directory, entry.name)],
  );
const pages = files(docs).filter((file) => file.endsWith('.mdx'));
const english = pages.filter((file) => !file.endsWith('.de.mdx'));
assert.ok(english.length >= 30, 'Expected complete usage documentation');
const snippets = [];
for (const file of pages) {
  const source = readFileSync(file, 'utf8');
  assert.match(source, /^---\ntitle: .+\ndescription: .+\n---/);
  const german = file.endsWith('.de.mdx');
  const counterpart = german
    ? file.replace('.de.mdx', '.mdx')
    : file.replace('.mdx', '.de.mdx');
  assert.ok(existsSync(counterpart), `Missing translation: ${counterpart}`);
  assert.ok(!source.includes('@docs/'), `Unresolved link placeholder: ${file}`);
  const withoutCode = source.replace(/^```[^\n]*\n[\s\S]*?^```/gm, '');
  for (const match of withoutCode.matchAll(/(?:\]\(|href=")\/(en|de)\/docs\/?([^\s)#"]*)/g)) {
    const [, lang, slug] = match;
    assert.equal(lang, german ? 'de' : 'en', `Cross-language internal link: ${file}`);
    const suffix = german ? '.de.mdx' : '.mdx';
    const target = path.join(docs, slug.replace(/\/$/, '') || 'index') + suffix;
    assert.ok(existsSync(target), `Broken documentation link ${match[0]} in ${file}`);
  }
  if (!german)
    for (const match of source.matchAll(/^```tsx[^\n]*\n([\s\S]*?)^```/gm)) {
      if (/export (?:default )?function /.test(match[1]))
        snippets.push({ file, code: match[1] });
    }
}
for (const file of files(docs).filter((file) => /meta(?:\.de)?\.json$/.test(file))) {
  const meta = JSON.parse(readFileSync(file, 'utf8'));
  const suffix = file.endsWith('.de.json') ? '.de.mdx' : '.mdx';
  for (const slug of meta.pages)
    assert.ok(
      existsSync(path.join(path.dirname(file), slug) + suffix) ||
        existsSync(path.join(path.dirname(file), slug, 'meta.json')),
      `Missing navigation target ${slug} in ${file}`,
    );
}
const temporary = mkdtempSync(path.join(root, '.docs-examples-'));
try {
  const paths = snippets.map((snippet, index) => {
    const file = path.join(temporary, `example-${index}.tsx`);
    writeFileSync(file, snippet.code);
    return file;
  });
  const globals = path.join(temporary, 'global.d.ts');
  writeFileSync(globals, 'declare module "*.css";');
  paths.push(globals);
  const program = ts.createProgram(paths, {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    skipLibCheck: true,
    noEmit: true,
    allowImportingTsExtensions: true,
    types: ['nativewind/types'],
  });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length) {
    for (const diagnostic of diagnostics) {
      const index = diagnostic.file ? paths.indexOf(diagnostic.file.fileName) : -1;
      if (index >= 0 && snippets[index])
        console.error(`From ${path.relative(root, snippets[index].file)}`);
    }
    console.error(
      ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCurrentDirectory: () => root,
        getCanonicalFileName: (f) => f,
        getNewLine: () => '\n',
      }),
    );
    process.exitCode = 1;
  } else
    console.log(
      `${pages.length} localized pages, internal links, navigation and ${snippets.length} complete React Native examples verified.`,
    );
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
