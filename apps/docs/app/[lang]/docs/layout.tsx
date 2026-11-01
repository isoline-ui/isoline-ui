import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { source } from '@/lib/source';
import { Brand } from '@/components/brand';
import { repository } from '@/lib/site';
import type { ReactNode } from 'react';
export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <DocsLayout
      tree={source.getPageTree(lang)}
      nav={{ title: <Brand />, url: `/${lang}` }}
      githubUrl={repository}
      links={[
        {
          text: lang === 'de' ? 'Einstieg' : 'Get started',
          url: `/${lang}/docs/getting-started/installation`,
          active: 'nested-url',
        },
      ]}
      sidebar={{ defaultOpenLevel: 1 }}
    >
      {children}
    </DocsLayout>
  );
}
