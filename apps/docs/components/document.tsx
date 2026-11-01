import '@fontsource-variable/inter';
import '@fontsource-variable/manrope';
import '@/app/global.css';
import { Provider } from './provider';
import type { ReactNode } from 'react';
import type { Locale } from '@/lib/i18n';
export function Document({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <Provider locale={locale}>{children}</Provider>
      </body>
    </html>
  );
}
