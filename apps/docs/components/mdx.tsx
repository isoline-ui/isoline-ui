import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import type { MDXComponents } from 'mdx/types';
import { ComponentPreview } from './preview';
import Link from 'next/link';
export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Tab,
    Tabs,
    Step,
    Steps,
    ComponentPreview,
    a: ({ href = '', ...props }: React.ComponentProps<'a'>) => (
      <Link href={href} {...props} prefetch={false} />
    ),
    ...components,
  } satisfies MDXComponents;
}
export const useMDXComponents = getMDXComponents;
