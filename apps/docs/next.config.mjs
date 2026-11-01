import { createMDX } from 'fumadocs-mdx/next';
import path from 'node:path';
const withMDX = createMDX();
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/isoline-ui';
export default withMDX({
  output: 'export',
  experimental: { globalNotFound: true },
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  turbopack: { root: path.resolve(import.meta.dirname, '../..') },
});
