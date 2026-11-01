import { Document } from '@/components/document';
import type { ReactNode } from 'react';
export { metadata } from '@/lib/metadata';
export default function Layout({ children }: { children: ReactNode }) {
  return <Document locale="en">{children}</Document>;
}
