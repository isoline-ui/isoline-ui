'use client';
import { useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Folder,
  Inbox,
  Moon,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { themes } from '../../../packages/react-native/src/theme';

const previewThemes = ['violet', 'teal', 'cyan'] as const;
type PreviewTheme = (typeof previewThemes)[number];
type PreviewPlatform = 'ios' | 'android';
const platformKey = 'isoline-preview-platform';
let currentPlatform: PreviewPlatform = 'android';
function readPlatform(): PreviewPlatform {
  try {
    const saved = localStorage.getItem(platformKey);
    if (saved === 'ios' || saved === 'android') return saved;
  } catch {
    /* Storage may be unavailable in private browsing. */
  }
  return currentPlatform;
}
function subscribePlatform(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('isoline-platform-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('isoline-platform-change', callback);
  };
}
function setPlatform(platform: PreviewPlatform) {
  currentPlatform = platform;
  try {
    localStorage.setItem(platformKey, platform);
  } catch {
    /* Keep the in-memory preference. */
  }
  window.dispatchEvent(new Event('isoline-platform-change'));
}
const serverPlatform = (): PreviewPlatform => 'android';

export function ComponentPreview({
  kind = 'default',
  hero = false,
}: {
  kind?: string;
  hero?: boolean;
}) {
  const { locale } = useI18n();
  const de = locale === 'de';
  const [theme, setTheme] = useState<PreviewTheme>('violet');
  const platform = useSyncExternalStore(subscribePlatform, readPlatform, serverPlatform);
  const [dark, setDark] = useState(false);
  const [selected, setSelected] = useState('all');
  const [enabled, setEnabled] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const modal = useRef<HTMLDialogElement>(null);
  const tokens = themes[theme][dark ? 'dark' : 'light'].tokens;
  const style = Object.fromEntries(
    Object.entries(tokens).map(([key, value]) => [`--demo${key.slice(1)}`, `hsl(${value})`]),
  ) as CSSProperties;
  const button = (label: string, variant = 'filled') => (
    <button
      key={label}
      type="button"
      className={`demo-button ${variant}`}
      onClick={() => setStatus(de ? `${label} ausgewählt` : `${label} selected`)}
    >
      {label}
    </button>
  );
  const toggle = (
    <button
      type="button"
      className="demo-switch"
      role="switch"
      aria-checked={enabled}
      aria-label={de ? 'Benachrichtigungen' : 'Notifications'}
      onClick={() => setEnabled(!enabled)}
    >
      <span />
    </button>
  );
  const chips = (
    <div className="demo-group">
      {[
        ['all', de ? 'Alle' : 'All'],
        ['saved', de ? 'Gespeichert' : 'Saved'],
        ['recent', de ? 'Zuletzt' : 'Recent'],
      ].map(([id, label]) => (
        <button
          key={id}
          type="button"
          aria-pressed={selected === id}
          className={selected === id ? 'selected' : ''}
          onClick={() => setSelected(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
  return (
    <div
      className={`component-preview ${hero ? 'hero-preview' : ''}`}
      data-platform={platform}
      style={style}
    >
      <div className="preview-controls">
        <div
          className="preview-choices"
          role="group"
          aria-label={de ? 'Theme auswählen' : 'Choose a theme'}
        >
          {previewThemes.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={theme === name}
              onClick={() => setTheme(name)}
            >
              {name[0].toUpperCase() + name.slice(1)}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="preview-mode"
          aria-pressed={dark}
          aria-label={
            dark
              ? de
                ? 'Helle Vorschau'
                : 'Light preview'
              : de
                ? 'Dunkle Vorschau'
                : 'Dark preview'
          }
          onClick={() => setDark(!dark)}
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
      <div className="preview-platform-controls">
        <span>Layout</span>
        <div
          className="preview-choices"
          role="group"
          aria-label={de ? 'Plattform auswählen' : 'Choose a platform'}
        >
          {(['android', 'ios'] as const).map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={platform === name}
              onClick={() => setPlatform(name)}
            >
              {name === 'ios' ? 'iOS' : 'Android'}
            </button>
          ))}
        </div>
      </div>
      <div className={`preview-canvas preview-${kind}`}>
        {kind === 'default' && platform === 'android' && (
          <div className="demo-screen">
            <div className="demo-screen-heading">
              <div>
                <span className="demo-overline">
                  {de ? 'ALLES AN EINEM ORT' : 'A LITTLE MORE ORGANIZED'}
                </span>
                <h3>{de ? 'Dein Bereich.' : 'Your space.'}</h3>
              </div>
              <button
                type="button"
                className="demo-icon"
                aria-label={de ? 'Einstellungen öffnen' : 'Open settings'}
                onClick={() =>
                  setStatus(de ? 'Alles nach deinem Geschmack.' : 'Make yourself at home.')
                }
              >
                <Settings2 size={20} />
              </button>
            </div>
            <div className="demo-welcome">
              <div className="demo-flower">
                <Sparkles size={26} />
              </div>
              <div>
                <strong>{de ? 'Platz für neue Ideen' : 'Room for a new idea'}</strong>
                <p>{de ? 'Mach etwas daraus.' : 'Make a little something.'}</p>
              </div>
            </div>
            {chips}
            <div className="demo-row">
              <div className="demo-row-icon">
                <Inbox size={19} />
              </div>
              <div>
                <strong>
                  {selected === 'saved'
                    ? de
                      ? 'Gespeicherte Ideen'
                      : 'Saved ideas'
                    : selected === 'recent'
                      ? de
                        ? 'Zuletzt geöffnet'
                        : 'Recently opened'
                      : de
                        ? 'Ein guter Anfang'
                        : 'A good beginning'}
                </strong>
                <span>{de ? 'Alles, was du brauchst' : 'Everything you need'}</span>
              </div>
              <span className="demo-counter">
                {selected === 'saved' ? '6' : selected === 'recent' ? '3' : '12'}
              </span>
            </div>
            <div className="demo-row">
              <div className="demo-row-icon lilac">
                <Folder size={19} />
              </div>
              <div>
                <strong>{de ? 'Dein nächstes Projekt' : 'Your next project'}</strong>
                <span>{de ? 'Nimm dir einen Moment' : 'Take a moment to explore'}</span>
              </div>
              <ChevronDown size={17} />
            </div>
            <div className="demo-bottom">
              <div className="demo-switch-label">
                <span>{de ? 'Benachrichtigungen' : 'Notifications'}</span>
                {toggle}
              </div>
              <button
                type="button"
                className="demo-button filled"
                onClick={() =>
                  setStatus(de ? 'Bereit für deine nächste Idee.' : 'Ready for your next idea.')
                }
              >
                <Plus size={16} />
                {de ? 'Etwas Neues' : 'Create something'}
              </button>
            </div>
          </div>
        )}
        {kind === 'default' && platform === 'ios' && (
          <div className="demo-ios-screen">
            <div className="demo-ios-navigation">
              <button
                type="button"
                onClick={() => setStatus(de ? 'Übersicht ausgewählt' : 'Overview selected')}
              >
                <ChevronLeft size={20} /> {de ? 'Übersicht' : 'Overview'}
              </button>
              <button
                type="button"
                aria-label={de ? 'Einstellungen öffnen' : 'Open settings'}
                onClick={() =>
                  setStatus(de ? 'Alles nach deinem Geschmack.' : 'Make yourself at home.')
                }
              >
                <Settings2 size={20} />
              </button>
            </div>
            <h3>{de ? 'Dein Bereich' : 'Your space'}</h3>
            <p className="demo-ios-subtitle">
              {de ? 'Platz für deine Ideen.' : 'Room for your ideas.'}
            </p>
            {chips}
            <p className="demo-ios-section-label">
              {de ? 'DEINE SAMMLUNG' : 'YOUR COLLECTION'}
            </p>
            <div className="demo-ios-list">
              {[
                {
                  icon: Inbox,
                  label:
                    selected === 'saved'
                      ? de
                        ? 'Gespeicherte Ideen'
                        : 'Saved ideas'
                      : selected === 'recent'
                        ? de
                          ? 'Zuletzt geöffnet'
                          : 'Recently opened'
                        : de
                          ? 'Alle Ideen'
                          : 'All ideas',
                  count: selected === 'saved' ? '6' : selected === 'recent' ? '3' : '12',
                },
                { icon: Folder, label: de ? 'Projekte' : 'Projects', count: '2' },
              ].map(({ icon: Icon, label, count }) => (
                <button
                  type="button"
                  className="demo-ios-list-row"
                  key={label}
                  onClick={() => setStatus(de ? `${label} geöffnet` : `${label} opened`)}
                >
                  <span className="demo-ios-list-icon">
                    <Icon size={17} />
                  </span>
                  <span>{label}</span>
                  <span className="demo-ios-detail">{count}</span>
                  <ChevronRight size={15} />
                </button>
              ))}
            </div>
            <p className="demo-ios-section-label">{de ? 'EINSTELLUNGEN' : 'PREFERENCES'}</p>
            <div className="demo-ios-list demo-ios-notifications">
              <span>{de ? 'Benachrichtigungen' : 'Notifications'}</span>
              {toggle}
            </div>
            <div className="demo-ios-toolbar">
              <span>{de ? 'Alles auf einen Blick' : 'Everything in one place'}</span>
              <button
                type="button"
                aria-label={de ? 'Etwas Neues' : 'Create something'}
                onClick={() =>
                  setStatus(de ? 'Bereit für deine nächste Idee.' : 'Ready for your next idea.')
                }
              >
                <Plus size={22} />
              </button>
            </div>
          </div>
        )}
        {kind === 'button' && (
          <div className="demo-flex">
            {button(de ? 'Speichern' : 'Save')}
            {button(de ? 'Entwurf' : 'Draft', 'tonal')}
            {button(de ? 'Abbrechen' : 'Cancel', 'outline')}
            {button(de ? 'Mehr erfahren' : 'Learn more', 'ghost')}
            <button type="button" className="demo-button filled" disabled>
              {de ? 'Deaktiviert' : 'Disabled'}
            </button>
          </div>
        )}
        {kind === 'group' && chips}
        {kind === 'filters' && (
          <div className="demo-flex">
            {['Design', 'React Native', 'Expo'].map((item) => (
              <button
                type="button"
                className={`demo-chip ${selected === item ? 'selected' : ''}`}
                key={item}
                aria-pressed={selected === item}
                onClick={() => setSelected(selected === item ? '' : item)}
              >
                {selected === item && <Check size={14} />} {item}
              </button>
            ))}
          </div>
        )}
        {kind === 'fields' && (
          <div className="demo-fields">
            <label>
              {de ? 'Projektname' : 'Project name'}
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={de ? 'Eine neue Idee' : 'A new idea'}
              />
            </label>
            <div className="demo-search">
              <Search size={18} />
              <input
                aria-label={de ? 'Vorschau durchsuchen' : 'Search preview'}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={de ? 'Suchen…' : 'Search…'}
              />
              {query && (
                <button
                  type="button"
                  aria-label={de ? 'Suche leeren' : 'Clear search'}
                  onClick={() => setQuery('')}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        )}
        {kind === 'switch' && (
          <div className="demo-switch-label">
            <span>{de ? 'Benachrichtigungen' : 'Notifications'}</span>
            {toggle}
          </div>
        )}
        {kind === 'text' && (
          <div className="demo-type">
            <span className="demo-overline">
              {de ? 'EIN KLARER ANFANG' : 'A CLEAR BEGINNING'}
            </span>
            <h3>{de ? 'Worte mit Gewicht.' : 'Words with presence.'}</h3>
            <p>
              {de
                ? 'Lesbare Texte, klare Hierarchie und Raum für deine Inhalte.'
                : 'Readable text, a clear hierarchy, and room for your content.'}
            </p>
            <code>42.00</code>
          </div>
        )}
        {kind === 'loading' && (
          <div className="demo-loading">
            <div className="demo-flower spinning">
              <Sparkles size={22} />
            </div>
            <div className="demo-progress">
              <span />
            </div>
            <span>{de ? 'Wird geladen…' : 'Loading…'}</span>
          </div>
        )}
        {kind === 'shapes' && (
          <div className="demo-shapes">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`demo-flower shape-${i}`}>
                <Sparkles size={23} />
              </div>
            ))}
          </div>
        )}
        {kind === 'surface' && (
          <div className="demo-surface-scene">
            <div className="demo-orb one" />
            <div className="demo-orb two" />
            <div className="demo-glass">
              <button
                type="button"
                className="demo-icon"
                aria-label={de ? 'Zurück' : 'Go back'}
                onClick={() => setStatus(de ? 'Zurück ausgewählt' : 'Back selected')}
              >
                <ArrowLeft size={18} />
              </button>
              <strong>{de ? 'Ganz in deinem Element' : 'In your element'}</strong>
              <button
                type="button"
                className="demo-icon"
                aria-label={de ? 'Hinzufügen' : 'Add item'}
                onClick={() => setStatus(de ? 'Hinzufügen ausgewählt' : 'Add selected')}
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        )}
        {kind === 'overlays' && (
          <>
            <button
              type="button"
              className="demo-button filled"
              onClick={() => modal.current?.showModal()}
            >
              {de ? 'Dialog ausprobieren' : 'Try a dialog'}
            </button>
            <dialog ref={modal} className="demo-dialog">
              <form method="dialog">
                <h3>{de ? 'Platz für eine neue Idee' : 'Make room for a new idea'}</h3>
                <p>{de ? 'Gib deinem Projekt einen Namen.' : 'Give your project a name.'}</p>
                <input
                  aria-label={de ? 'Projektname' : 'Project name'}
                  placeholder={de ? 'Meine Idee' : 'My idea'}
                />
                <div>
                  <button className="demo-button ghost" value="cancel">
                    {de ? 'Abbrechen' : 'Cancel'}
                  </button>
                  <button className="demo-button filled" value="save">
                    {de ? 'Speichern' : 'Save'}
                  </button>
                </div>
              </form>
            </dialog>
          </>
        )}
        <span className="demo-status" role="status" aria-live="polite">
          {status}
        </span>
      </div>
      <div className="preview-caption">
        <span className="preview-dot" />
        {platform === 'ios' ? 'iOS' : 'Android'} ·{' '}
        {de ? 'Interaktive Web-Illustration' : 'Interactive web illustration'}
        <span className="preview-caption-extra">
          {kind === 'surface' && platform === 'ios'
            ? de
              ? 'Natives Glas: iOS 26+'
              : 'Native glass: iOS 26+'
            : 'React Native + Expo'}
        </span>
      </div>
    </div>
  );
}
