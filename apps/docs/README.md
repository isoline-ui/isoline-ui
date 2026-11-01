# Isoline documentation

A bilingual Fumadocs website for people using Isoline UI. English is the default;
German pages cover the same topics. The public site is
https://isoline-ui.github.io/isoline-ui/.

## Run locally

From the repository root:

```sh
npm ci
npm run build
npm run docs:dev
```

Open http://localhost:3000/isoline-ui/. The application uses a static export and
Webpack. Fonts are packaged locally, so builds do not need a Google Fonts fetch.

## Write a page

Content lives in `content/docs/`. An English page is `example.mdx`; its German
translation is `example.de.mdx`. Give each page a title and description, and add
it to the folder's `meta.json` and `meta.de.json` navigation where needed. Keep
internal links in the reader's language, for example `/en/docs/components/button`
and `/de/docs/components/button`. Next.js applies the Pages base path.

Write about using the package: a concrete task, a working example, the useful
options, and common mistakes. Check prop names against the source. Keep internal
design discussions out of the usage guides. Full TypeScript examples with an
exported function are checked against the actual package declarations.

`ComponentPreview` embeds the actual UI components through React Native Web in an
isolated static Expo bundle. Theme, appearance and platform changes use same-origin
messages and preserve component state. Platform selection persists across pages.
Browser glass uses CSS blur with solid accessibility/feature fallbacks; it is not
Apple's native Liquid Glass. Test native materials in the Expo showcase.

`npm run docs:build` builds and copies the preview runtime before the Next export.
For development, run `npm run docs:preview` after runtime changes, then `npm run docs:dev`.
To check browser behavior after building, install Playwright browsers and run
`npm run docs:test` (Chromium, Firefox and WebKit).

## Check and export

```sh
npm run docs:build
npm run docs:check
node scripts/check-docs-export.mjs
```

These validate localized pages, navigation, internal links, complete React Native
examples, exported routes/assets, the search index, and sitemap. The output is
`out/`. Search is a static JSON asset and needs no server.

## Publish

The Documentation workflow builds, checks, and deploys the exported files to
GitHub Pages after relevant changes on `main`. Pull requests build and validate
without deploying. Select **GitHub Actions** once in the repository’s Settings → Pages → Build and
deployment → Source. The workflow uses the repository’s built-in token. No npm publish token or custom
hosting account is needed.

The workflow supplies `NEXT_PUBLIC_BASE_PATH` and `NEXT_PUBLIC_SITE_ORIGIN` from
GitHub Pages. Local defaults are `/isoline-ui` and `https://isoline-ui.github.io`.
