# Isoline UI

[Read the documentation](https://isoline-ui.github.io/isoline-ui/) · [Deutsch](https://isoline-ui.github.io/isoline-ui/de/docs/)

Shared expressive React Native components for Android and iOS.

Isoline keeps the common interaction and accessibility rules in one place while
allowing each app to keep its own colours and typography. The built-in
themes are Violet, Teal and Cyan.

**Status:** 0.1.0-alpha.2, distributed through GitHub Releases. Isoline is not yet
published to npm. The optional native package provides Android system colors and
iOS Liquid Glass surfaces. The three apps already use shared primitives through
forwarding modules and vendored archives. The expanded component catalogue is
part of the paired 0.1.0-alpha.3 development snapshots; older alpha.2 archives
do not contain it.

## What is here

- Buttons, button groups, chips, icon buttons and native switches.
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

## Test installation without npmjs

The alpha package is distributed as an npm-compatible tarball on GitHub Releases.
Install this fixed version from an app directory:

```sh
npm install https://github.com/isoline-ui/isoline-ui/releases/download/v0.1.0-alpha.2/isoline-ui-react-native-0.1.0-alpha.2.tgz
```

The import name remains `@isoline-ui/react-native`. Isoline itself is downloaded
from GitHub; its normal dependencies and peers still use the app's configured
registry. Keep the peer versions selected by your Expo SDK.

Follow the package guide for the NativeWind content scan, preset and provider.
Installing the dependency alone does not migrate the app's existing components.
See [distribution](docs/distribution.md) for local tarballs and update rules.

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
