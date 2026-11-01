import Link from 'next/link';
import { Document } from '@/components/document';
import { BrandMark } from '@/components/brand';
export default function NotFound() {
  return (
    <Document locale="en">
      <main className="error-page">
        <BrandMark width={58} height={58} />
        <p className="eyebrow">404 · ISOLINE UI</p>
        <h1>Let’s find another path.</h1>
        <p>This page isn’t here. The documentation is a good place to start.</p>
        <Link className="primary-link" href="/en/docs">
          Back to the docs
        </Link>
      </main>
    </Document>
  );
}
