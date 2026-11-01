import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { absoluteUrl } from '@/lib/site';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl('/'),
      alternates: { languages: { en: absoluteUrl('/en/'), de: absoluteUrl('/de/') } },
    },
    ...['en', 'de'].flatMap((locale) => [
      { url: absoluteUrl(`/${locale}/`) },
      ...source.getPages(locale).map((page) => ({ url: absoluteUrl(page.url + '/') })),
    ]),
  ];
}
