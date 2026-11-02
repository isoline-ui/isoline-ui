'use client';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useI18n } from 'fumadocs-ui/contexts/i18n';

const previewThemes = ['violet', 'teal', 'cyan'] as const;
type PreviewTheme = (typeof previewThemes)[number];
type PreviewPlatform = 'ios' | 'android';
const platformKey = 'isoline-preview-platform';
let currentPlatform: PreviewPlatform = 'ios';
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
const serverPlatform = (): PreviewPlatform => 'ios';

export function ComponentPreview({
  kind = 'default',
  hero = false,
}: {
  kind?: string;
  hero?: boolean;
}) {
  const { locale } = useI18n();
  const de = locale === 'de';
  const platform = useSyncExternalStore(subscribePlatform, readPlatform, serverPlatform);
  const [theme, setTheme] = useState<PreviewTheme>('violet');
  const [dark, setDark] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '/isoline-ui';
  const send = () =>
    frame.current?.contentWindow?.postMessage(
      { type: 'isoline-preview-config', platform, theme, dark },
      window.location.origin,
    );
  useEffect(() => {
    send();
    const ready = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.source === frame.current?.contentWindow &&
        event.data?.type === 'isoline-preview-ready'
      )
        send();
    };
    window.addEventListener('message', ready);
    return () => window.removeEventListener('message', ready);
  }, [platform, theme, dark]);
  const height = ['materials', 'material-controls', 'navigation', 'material-overlays'].includes(
    kind,
  )
    ? 660
    : ['tab-bar', 'surface-group', 'popover', 'floating-actions'].includes(kind)
      ? 480
      : kind === 'toolbar'
        ? 460
        : kind === 'default'
          ? 540
          : kind === 'fields'
            ? 360
            : kind === 'overlays'
              ? 340
              : kind === 'surface'
                ? 460
                : kind === 'button'
                  ? 300
                  : 240;
  return (
    <div className={`component-preview ${hero ? 'hero-preview' : ''}`} data-platform={platform}>
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
          className="preview-mode"
          type="button"
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
          {(['ios', 'android'] as const).map((name) => (
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
      <iframe
        ref={frame}
        className="preview-runtime"
        title={`${platform === 'ios' ? 'iOS' : 'Android'} – ${de ? 'Interaktive Komponentenvorschau' : 'Interactive component preview'}`}
        src={`${base}/previews/?preview=1&kind=${encodeURIComponent(kind)}&locale=${de ? 'de' : 'en'}`}
        height={height}
        loading={hero ? 'eager' : 'lazy'}
        onLoad={send}
      />
      <div className="preview-caption">
        <span className="preview-dot" />
        {de ? 'Echte Komponenten · React Native Web' : 'Live components · React Native Web'}
        <span className="preview-caption-extra">
          {de ? 'Glas im Web: CSS-Annäherung' : 'Web glass: CSS approximation'}
        </span>
      </div>
    </div>
  );
}
