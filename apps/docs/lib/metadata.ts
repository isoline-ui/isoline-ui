import type { Metadata } from 'next';
import { absoluteUrl, siteOrigin } from './site';
export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: 'Isoline UI — expressive React Native components',
    template: '%s · Isoline UI',
  },
  description:
    'Build expressive React Native interfaces with practical guides, accessible components, Android system colors and native iOS Liquid Glass.',
  applicationName: 'Isoline UI',
  icons: { icon: absoluteUrl('/favicon.svg') },
  openGraph: {
    type: 'website',
    siteName: 'Isoline UI',
    title: 'Isoline UI',
    description:
      'Expressive components. Naturally native. Documentation for React Native and Expo.',
    url: absoluteUrl('/'),
  },
  twitter: {
    card: 'summary',
    title: 'Isoline UI',
    description: 'Expressive React Native components. Documentation in English and German.',
  },
};
