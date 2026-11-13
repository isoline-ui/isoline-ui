import Link from 'next/link';
import uiPackage from '../../../../../../packages/react-native/package.json';
import { source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  EditOnGitHub,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import { absoluteUrl, repository } from '@/lib/site';
import type { Metadata } from 'next';
type Props = { params: Promise<{ lang: string; slug?: string[] }> };
export default async function Page({ params }: Props) {
  const { lang, slug } = await params;
  const page = source.getPage(slug, lang);
  if (!page) notFound();
  const MDX = page.data.body;
  return (
    <DocsPage toc={page.data.toc}>
      <div className="page-eyebrow">
        {slug?.[0] === 'components'
          ? lang === 'de'
            ? 'Komponenten'
            : 'Components'
          : 'ISOLINE UI'}
      </div>
      <p className="text-sm text-fd-muted-foreground">
        {lang === 'de'
          ? `API ${uiPackage.version} · npm · `
          : `API ${uiPackage.version} · npm · `}
        <Link
          prefetch={false}
          className="underline"
          href={`/${lang}/docs/getting-started/installation/`}
        >
          {lang === 'de' ? 'Installationsweg' : 'Installation instructions'}
        </Link>
      </p>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
      <EditOnGitHub href={`${repository}/blob/main/apps/docs/content/docs/${page.path}`} />
    </DocsPage>
  );
}
export function generateStaticParams() {
  return source.generateParams();
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const page = source.getPage(slug, lang);
  if (!page) notFound();
  const suffix = slug?.length ? `/${slug.join('/')}` : '';
  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical: absoluteUrl(`/${lang}/docs${suffix}/`),
      languages: {
        en: absoluteUrl(`/en/docs${suffix}/`),
        de: absoluteUrl(`/de/docs${suffix}/`),
      },
    },
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      url: absoluteUrl(`/${lang}/docs${suffix}/`),
      locale: lang === 'de' ? 'de_DE' : 'en_US',
    },
  };
}
