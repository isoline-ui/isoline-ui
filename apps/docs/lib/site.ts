export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/isoline-ui';
export const repository = 'https://github.com/isoline-ui/isoline-ui';
export const release = `${repository}/releases/tag/v0.1.0-alpha.1`;
export const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN || 'https://isoline-ui.github.io';
export const absoluteUrl = (path: string) => `${siteOrigin}${basePath}${path}`;
