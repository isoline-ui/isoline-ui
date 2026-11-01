import { Home } from '@/components/home';
import { isLocale } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/site';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    title:
      lang === 'de'
        ? 'Ausdrucksstarke React-Native-Komponenten'
        : 'Expressive React Native components',
    alternates: {
      canonical: absoluteUrl(`/${lang}/`),
      languages: { en: absoluteUrl('/en/'), de: absoluteUrl('/de/') },
    },
  };
}
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <Home locale={lang} />;
}
