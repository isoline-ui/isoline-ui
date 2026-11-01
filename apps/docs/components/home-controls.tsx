'use client';
import Link from 'next/link';
import { useTheme } from 'fumadocs-ui/provider/base';
import { Moon, Sun, Languages, Search } from 'lucide-react';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import type { Locale } from '@/lib/i18n';
export function HomeControls({ locale }: { locale: Locale }) {
  const { setTheme, resolvedTheme } = useTheme();
  const { setOpenSearch } = useSearchContext();
  return (
    <div className="home-controls">
      <button
        type="button"
        aria-label={locale === 'de' ? 'Dokumentation durchsuchen' : 'Search documentation'}
        onClick={() => setOpenSearch(true)}
      >
        <Search size={18} />
        <kbd>⌘ K</kbd>
      </button>
      <Link
        href={`/${locale === 'de' ? 'en' : 'de'}/`}
        aria-label={locale === 'de' ? 'Switch to English' : 'Auf Deutsch lesen'}
      >
        <Languages size={17} />
        <span>{locale === 'de' ? 'EN' : 'DE'}</span>
      </Link>
      <button
        type="button"
        aria-label={locale === 'de' ? 'Darstellung wechseln' : 'Toggle color theme'}
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      >
        <Sun className="theme-sun" size={18} />
        <Moon className="theme-moon" size={18} />
      </button>
    </div>
  );
}
