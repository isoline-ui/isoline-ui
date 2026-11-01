'use client';
import { useRef, useState, type CSSProperties } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronDown,
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
import { presetTokens } from '../../../packages/react-native/src/preset-tokens';

type BrandName = keyof typeof presetTokens;
export function ComponentPreview({
  kind = 'default',
  hero = false,
}: {
  kind?: string;
  hero?: boolean;
}) {
  const { locale } = useI18n();
  const de = locale === 'de';
  const [brand, setBrand] = useState<BrandName>('inboki');
  const [dark, setDark] = useState(false);
  const [selected, setSelected] = useState('all');
  const [enabled, setEnabled] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const modal = useRef<HTMLDialogElement>(null);
  const tokens = presetTokens[brand][dark ? 'dark' : 'light'];
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
    <div className={`component-preview ${hero ? 'hero-preview' : ''}`} style={style}>
      <div className="preview-controls">
        <div className="brand-choices" aria-label={de ? 'Theme auswählen' : 'Choose a theme'}>
          {(['inboki', 'yours', 'atlas'] as const).map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={brand === name}
              onClick={() => setBrand(name)}
            >
              {name[0].toUpperCase() + name.slice(1)}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="preview-mode"
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
      <div className={`preview-canvas preview-${kind}`}>
        {kind === 'default' && (
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
        {de ? 'Interaktive Web-Illustration' : 'Interactive web illustration'}
        <span className="preview-caption-extra">
          {kind === 'surface'
            ? de
              ? 'Natives Glas: iOS 26+'
              : 'Native glass: iOS 26+'
            : 'React Native + Expo'}
        </span>
      </div>
    </div>
  );
}
