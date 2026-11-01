import { notFound } from 'next/navigation';
import { Document } from '@/components/document';
import { isLocale } from '@/lib/i18n';
import type { ReactNode } from 'react';
export { metadata } from '@/lib/metadata';
export const dynamicParams = false;
export function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'de' }];
}
export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <Document locale={lang}>{children}</Document>;
}
