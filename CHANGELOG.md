# Changelog

## 1.0.1

- iOS: `Pressable` no longer hands NativeWind a style callback, which it dropped whenever a `className` was set. Chips, buttons and other pressables keep their radii, heights and colours.
- iOS: `TopBar` puts Liquid Glass on its controls instead of a full-width band: the back button is a glass disc, the title and the actions each sit in a glass capsule. With `floating`, it lies over the screen with a scroll-edge fade under it; pad the content by `useTopBarInset()`.
- `@isoline-ui/native` now peers on the matching `@isoline-ui/react-native`, so `npm ci` resolves again.

## 0.1.0-alpha.2

- Add keyboard-aware inline panels, scroll-coordinated sheet frames and a full opening/closing lifecycle. Configure handle or whole-panel gestures through the theme.
- Support Reanimated shared progress values and custom indicator height; flatten the wave with reduced motion. Add square and gable shapes.
- Add labelled password inputs, keyboard insets, refresh controls, headers, back buttons, toolbars, split buttons, badges, settings rows, empty states, snackbars and expandable floating action menus.
- Allow native material backgrounds for headers/toolbars through the provider's surface adapter. Preserve haptic preferences, translated labels and caller styling.
- Extend typography roles and expose pure RGB/HSL/Lab helpers through the native theme subpath.
- Add usage documentation in English and German, gesture physics regression tests and worklet closure checks.

Install the paired UI and native archives for this version from GitHub Releases. Select expo-glass-effect with Expo for your SDK. Native code changes require a new development or application build.
