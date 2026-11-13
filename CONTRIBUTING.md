# Contributing to Isoline UI

Thanks for helping. Isoline UI is a general-purpose React Native library, so every
change has to work for any app that consumes it.

## Ground rules

- Keep public APIs, presets, examples, docs and tests independent of particular
  consuming products. App data, routes, stores, credentials and brand assets do not
  belong here.
- Theme, labels, fonts and haptics are consumer contracts: take them from the
  provider, never hard-code them.
- No `~/` imports, Expo Router or app persistence inside the packages.
- React and the native runtimes stay peer dependencies.
- Keep `'worklet'` directives in the Metro sources and preserve declaration exports.
- Put platform differences behind shared components or `.ios`/`.android` files.
- Keep existing licence notices. New third-party artwork needs attribution in
  [NOTICE.md](NOTICE.md).
- Describe compatibility by framework and runtime versions.

## Setup

Requirements: Node.js 24+ and npm.

```sh
npm ci --ignore-scripts
npm run showcase
```

The showcase uses Expo 58. Use a development build for native modules.

## Before you open a pull request

```sh
npm run check
```

Also run the showcase Android and iOS bundle checks. A Metro export checks that the
bundle builds; it is not an Xcode or device test, so say which devices or simulators
you actually tried.

If you changed documentation or component APIs:

```sh
npm run docs:examples
npm run docs:check
```

Update both the English and German pages, and add a [CHANGELOG](CHANGELOG.md) entry
for user-facing changes.

## Pull requests

- Keep each pull request focused on one change.
- Explain what changed and why, and include screenshots or recordings for visual
  changes on both platforms where relevant.
- Mark breaking changes clearly.

## Releases

Maintainers make releases. Do not add npm tokens or other secrets to workflows or
source files.

## Code of conduct

Everyone taking part is expected to follow the [code of conduct](CODE_OF_CONDUCT.md).
