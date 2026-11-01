import { defineI18n } from 'fumadocs-core/i18n';
export const i18n = defineI18n({
  defaultLanguage: 'en',
  languages: ['en', 'de'],
  hideLocale: 'never',
  fallbackLanguage: null,
});
export type Locale = 'en' | 'de';
export const isLocale = (value: string): value is Locale => value === 'en' || value === 'de';
