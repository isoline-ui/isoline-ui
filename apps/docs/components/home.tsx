import Link from 'next/link';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Code2,
  Layers3,
  Palette,
  Smartphone,
} from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { Brand, BrandMark } from './brand';
import { HomeControls } from './home-controls';
import { ComponentPreview } from './preview';
import uiPackage from '../../../packages/react-native/package.json';
import { repository } from '@/lib/site';
export function Home({ locale }: { locale: Locale }) {
  const de = locale === 'de';
  const doc = `/${locale}/docs`;
  const cards = [
    {
      icon: Palette,
      title: de ? 'Deine Farben. Dein Gefühl.' : 'Your colors. Your character.',
      body: de
        ? 'Starte mit einem Theme und passe Farben und Typografie an deine App an.'
        : 'Start with a theme, then make the colors and typography feel like your app.',
      href: `${doc}/foundations/theming`,
      label: de ? 'Themes anpassen' : 'Explore theming',
    },
    {
      icon: Smartphone,
      title: de ? 'Auf jeder Plattform zu Hause.' : 'At home on every platform.',
      body: de
        ? 'Android-Systemfarben und natives iOS Liquid Glass – mit einer gemeinsamen API.'
        : 'Android system colors and native iOS Liquid Glass, with one familiar API.',
      href: `${doc}/native/overview`,
      label: de ? 'Native Funktionen nutzen' : 'Go native',
    },
    {
      icon: Layers3,
      title: de ? 'Kleine Teile. Viel möglich.' : 'Small pieces. More possibilities.',
      body: de
        ? 'Buttons, Felder, Sheets und Dialoge, die sich einfach zusammensetzen lassen.'
        : 'Buttons, fields, sheets, and dialogs that are easy to put together.',
      href: `${doc}/components/button`,
      label: de ? 'Komponenten entdecken' : 'Meet the components',
    },
  ];
  return (
    <div className="home">
      <a className="skip-link" href="#main">
        {de ? 'Zum Inhalt' : 'Skip to content'}
      </a>
      <header className="home-header">
        <Link href={`/${locale}/`} aria-label="Isoline UI">
          <Brand />
        </Link>
        <nav aria-label={de ? 'Hauptnavigation' : 'Main navigation'}>
          <Link href={doc}>{de ? 'Dokumentation' : 'Documentation'}</Link>
          <a href={repository} target="_blank" rel="noreferrer">
            GitHub <ArrowUpRight size={13} />
          </a>
        </nav>
        <HomeControls locale={locale} />
      </header>
      <main id="main">
        <section className="hero">
          <svg className="hero-contours" viewBox="0 0 800 800" fill="none" aria-hidden="true">
            {Array.from({ length: 15 }, (_, i) => (
              <path
                key={i}
                d={`M ${430 - i * 16} ${110 - i * 5} C ${720 - i * 6} ${15 + i * 8}, ${940 - i * 18} ${420 - i * 4}, ${630 - i * 10} ${660 - i * 14} S ${130 + i * 3} ${570 - i * 10}, ${250 + i * 8} ${290 - i * 8} S ${520 - i * 7} ${440 - i * 15}, ${430 - i * 16} ${110 - i * 5}`}
                stroke="currentColor"
              />
            ))}
          </svg>
          <div className="hero-copy">
            <a
              className="release-badge"
              href={`/${de ? 'de' : 'en'}/docs/getting-started/installation/`}
            >
              <span />
              {de
                ? `${uiPackage.version} · Entwicklungsstand`
                : `${uiPackage.version} · Development source`}
              <ArrowUpRight size={12} />
            </a>
            <p className="eyebrow">REACT NATIVE · EXPO · ISOLINE UI</p>
            <h1>
              {de ? (
                <>
                  Ausdrucksstark.
                  <br />
                  <span>Natürlich nativ.</span>
                </>
              ) : (
                <>
                  Expressive UI.
                  <br />
                  <span>Naturally native.</span>
                </>
              )}
            </h1>
            <p className="hero-description">
              {de
                ? 'Gib deiner App Charakter. Mit durchdachten Komponenten, flexiblen Themes und dem richtigen Gefühl auf iOS und Android.'
                : 'Give your app a little character. Thoughtful components, flexible themes, and the right feel on iOS and Android.'}
            </p>
            <div className="hero-actions">
              <Link className="primary-link" href={`${doc}/getting-started/installation`}>
                {de ? 'Loslegen' : 'Start building'}
                <ArrowRight size={17} />
              </Link>
              <Link className="secondary-link" href={`${doc}/components/button`}>
                {de ? 'Komponenten ansehen' : 'Explore components'}
                <ArrowDown size={15} />
              </Link>
            </div>
            <div className="hero-meta">
              <span>
                <Check size={13} />
                TypeScript
              </span>
              <span>
                <Check size={13} />
                NativeWind
              </span>
              <span>
                <Check size={13} />
                {de ? 'Open Source' : 'Open source'}
              </span>
            </div>
          </div>
          <div className="hero-art">
            <div className="hero-note">
              <span>01 / {de ? 'SPIEL EIN WENIG' : 'MAKE IT YOURS'}</span>
              <span>↓</span>
            </div>
            <ComponentPreview hero />
            <div className="floating-note">
              <Code2 size={15} />
              <span>{de ? 'Ein Theme. Alle Komponenten.' : 'One theme. Every component.'}</span>
            </div>
          </div>
        </section>
        <section
          className="home-features"
          aria-label={de ? 'Was du damit bauen kannst' : 'What you can build'}
        >
          {cards.map(({ icon: Icon, ...card }, i) => (
            <article key={card.href}>
              <div className="feature-top">
                <Icon size={23} />
                <span>0{i + 1}</span>
              </div>
              <h2>{card.title}</h2>
              <p>{card.body}</p>
              <Link href={card.href}>
                {card.label}
                <ArrowRight size={15} />
              </Link>
            </article>
          ))}
        </section>
        <section className="home-paths">
          <div>
            <p className="eyebrow">{de ? 'DEIN NÄCHSTER SCHRITT' : 'FIND YOUR NEXT STEP'}</p>
            <h2>{de ? 'Weniger suchen.\nMehr bauen.' : 'Less searching.\nMore building.'}</h2>
            <p>
              {de
                ? 'Verständliche Anleitungen, vollständige Beispiele und die Details, die du beim Entwickeln brauchst.'
                : 'Clear guides, complete examples, and the details you need while building.'}
            </p>
          </div>
          <div className="path-list">
            {[
              {
                number: '01',
                title: de ? 'Dein erster Bildschirm' : 'Build your first screen',
                text: de
                  ? 'Vom Provider bis zum ersten Button.'
                  : 'From the provider to your first button.',
                slug: 'getting-started/first-screen',
              },
              {
                number: '02',
                title: de ? 'Ein Formular, das funktioniert' : 'Put a form together',
                text: de
                  ? 'Eingaben, Validierung und ein guter Abschluss.'
                  : 'Inputs, validation, and a good finish.',
                slug: 'guides/forms',
              },
              {
                number: '03',
                title: de ? 'Die Farben des Systems' : 'Follow the system',
                text: de
                  ? 'Material You und native Glasflächen.'
                  : 'Material You and native glass surfaces.',
                slug: 'native/overview',
              },
            ].map((p) => (
              <Link key={p.number} href={`${doc}/${p.slug}`}>
                <span>{p.number}</span>
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </div>
                <ArrowUpRight size={20} />
              </Link>
            ))}
          </div>
        </section>
        <section className="home-cta">
          <BrandMark width={45} height={45} />
          <div>
            <h2>
              {de ? 'Deine nächste Idee passt hier rein.' : 'Your next idea belongs here.'}
            </h2>
            <p>
              {de ? 'Fang klein an. Mach es zu deiner App.' : 'Start small. Make it your own.'}
            </p>
          </div>
          <Link className="primary-link" href={`${doc}/getting-started/installation`}>
            {de ? 'Zur Dokumentation' : 'Open the docs'}
            <BookOpen size={16} />
          </Link>
        </section>
      </main>
      <footer className="home-footer">
        <span>Isoline UI · MIT</span>
        <span>
          {de
            ? 'Mit Fumadocs gebaut. Für Menschen geschrieben.'
            : 'Built with Fumadocs. Written for people.'}
        </span>
        <a href={repository}>
          GitHub <ArrowUpRight size={12} />
        </a>
      </footer>
    </div>
  );
}
