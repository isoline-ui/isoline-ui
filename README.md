# Isoline UI

[Read the documentation](https://isoline-ui.github.io/isoline-ui/) · [Deutsch](https://isoline-ui.github.io/isoline-ui/de/docs/)

Shared expressive React Native components for Android and iOS.

Isoline keeps the common interaction and accessibility rules in one place while
allowing each app to keep its own colours and typography. The built-in
themes are Violet, Teal and Cyan.

Isoline is published on npm as `@isoline-ui/react-native` and, for native
appearance, `@isoline-ui/native`. The [changelog](CHANGELOG.md) lists what each
version changed. Native appearance is optional.

## What is here

- Buttons with pending states, button groups, chips, icon buttons and native switches.
- Radio groups, searchable selections, reusable cards/list rows, accordions and skeletons.
- Shared field labels, hints and errors; protected overlay dismissal.
- Text, text fields, search, checkbox, slider, avatar and action chips.
- Calendar/date/time/color pickers and localized amount fields.
- Banners, controlled undo feedback, swipeable rows and image zoom.
- List selection/section controls and router-independent settings layouts.
- Bottom sheets, dialogs and action menus.
- Expressive loading indicators, progress, shapes and motion tokens.
- An explicit theme/labels/haptics provider with no app store or router imports.
- Light/dark presets and a runnable Expo component showcase.

The runtime source is shipped for Metro to compile with the consuming app's
NativeWind and Reanimated setup. Type declarations are generated separately.
React and native runtimes are peer dependencies.

[Choose components](https://isoline-ui.github.io/isoline-ui/en/docs/guides/choosing-components/)
or try the complete [form](https://isoline-ui.github.io/isoline-ui/en/docs/guides/form-screen/),
[list](https://isoline-ui.github.io/isoline-ui/en/docs/guides/data-list-screen/) and
[settings](https://isoline-ui.github.io/isoline-ui/en/docs/guides/settings-screen/) examples.

## Install

From your app:

```sh
npm install @isoline-ui/react-native
```

Commit `package.json` and the lockfile so CI installs the same version. For native
appearance, also install `@isoline-ui/native` at the same version.

Follow [installation](https://isoline-ui.github.io/isoline-ui/en/docs/getting-started/installation/)
for peers, NativeWind, Metro and providers. Installing the package alone does not
configure an app. See [distribution](docs/distribution.md) for how releases are made.

## Development

```sh
npm ci --ignore-scripts
npm run check
npm run pack
npm run showcase
```

The showcase uses Expo 58. For native modules, use a development build.
The initial compatibility targets are Expo 57/RN 0.86 and Expo 58/RN 0.88;
see [compatibility](docs/compatibility.md) for what has actually been verified.

See the [package guide](packages/react-native/README.md),
[design contract](docs/design.md) and [migration plan](docs/migration.md).

## Licence

MIT. Existing source notices are retained. See [NOTICE](NOTICE.md).

## Native appearance

Optional [`@isoline-ui/native`](packages/native/README.md) provides Android Material
You system colors and iOS Liquid Glass surfaces, with platform and accessibility
fallbacks. See [native integration](docs/native.md) and the showcase.
