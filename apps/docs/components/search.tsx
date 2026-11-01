'use client';
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from 'fumadocs-ui/components/dialog/search';
import { useStaticSearch } from 'fumadocs-core/search/client';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { basePath } from '@/lib/site';
export default function DocsSearch(props: SharedProps) {
  const { locale } = useI18n();
  const search = useStaticSearch({ locale, from: `${basePath}/search-index.json` });
  return (
    <SearchDialog {...props} {...search}>
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList />
      </SearchDialogContent>
    </SearchDialog>
  );
}
