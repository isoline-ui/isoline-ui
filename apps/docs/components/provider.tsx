'use client';
import { RootProvider } from 'fumadocs-ui/provider/next';
import type { ReactNode } from 'react';
import NextLink from 'next/link';
import type { Framework } from 'fumadocs-core/framework';
import DocsSearch from './search';
import type { Locale } from '@/lib/i18n';
// Static docs load routes on demand: avoid cancelling speculative RSC fetches
// during WebKit navigation and leave bandwidth for the interactive previews.
const DocumentationLink: NonNullable<Framework['Link']> = ({ href, prefetch, ...props }) =>
  href ? <NextLink {...props} href={href} prefetch={false} /> : <a {...props} />;
const german = {
  'Search(search trigger)': 'Suchen',
  'Search(search dialog)': 'Dokumentation durchsuchen',
  'Open Search(search trigger)(aria-label)': 'Suche öffnen',
  'Close Search(search dialog)(aria-label)': 'Suche schließen',
  'No results found(search dialog)': 'Keine Ergebnisse gefunden',
  'Search failed(search dialog)': 'Die Suche ist fehlgeschlagen',
  'On this page(table of contents)': 'Auf dieser Seite',
  'Table of Contents(inline table of contents)': 'Inhaltsverzeichnis',
  'Previous Page(pagination)': 'Vorherige Seite',
  'Next Page(pagination)': 'Nächste Seite',
  'Edit on GitHub(edit page)': 'Auf GitHub bearbeiten',
  'Copy Text(code block)(aria-label)': 'Code kopieren',
  'Copied Text(code block)(aria-label)': 'Code kopiert',
  'Choose a language(language switcher)': 'Sprache wählen',
  'Choose a language(language switcher)(aria-label)': 'Sprache wählen',
  'Toggle Menu(mobile menu)(aria-label)': 'Menü öffnen',
  'Open Sidebar(sidebar)(aria-label)': 'Navigation öffnen',
  'Close Sidebar(sidebar)(aria-label)': 'Navigation schließen',
  'Light(theme switcher)(aria-label)': 'Hell',
  'Dark(theme switcher)(aria-label)': 'Dunkel',
  'System(theme switcher)(aria-label)': 'System',
  'Toggle Theme(theme switcher)(aria-label)': 'Darstellung wechseln',
};
export function Provider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <RootProvider
      components={{ Link: DocumentationLink }}
      i18n={{
        locale,
        defaultLanguage: 'en',
        hideLocale: 'never',
        locales: [
          { locale: 'en', name: 'English' },
          { locale: 'de', name: 'Deutsch' },
        ],
        translations: locale === 'de' ? german : undefined,
      }}
      search={{ SearchDialog: DocsSearch }}
    >
      {children}
    </RootProvider>
  );
}
