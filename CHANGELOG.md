# Changelog

## 2.1.0

- New components: `Card`, `ListItem`, `FormField`, `RadioGroup`, `Combobox`, `Accordion` and `Skeleton`, with English and German guides, examples and reference screens.
- `Button` takes `loading` and `loadingLabel`: it shows a spinner, announces busy and stops activating, while keeping its size.
- `Dialog`, `BottomSheet`, `PanelSheet` and `Popover` take `dismissible`; when it is false, the backdrop, Back and the screen reader's dismiss leave it open, while the app's own buttons still close it.
- `BottomSheet` takes `keyboardAware`, which keeps searchable content above the keyboard on Android; iOS keeps its native avoidance.
- `SelectField` accepts `value={null}` with a `placeholder`.
- `LoadingIndicator` takes an `accessibilityLabel`; field errors in `Input` and `TextField` are announced to screen readers when they appear.

## 2.0.0

- Breaking: only the palette-named theme presets remain: `themes.violet`, `themes.teal` and `themes.cyan`. The deprecated aliases `themes.inboki`, `themes.yours` and `themes.atlas` are removed; use the palette name, or define your own alias in the app.
- iOS: buttons are capsules at the actual iOS heights (radius half the height, square icon buttons). Button now owns their iOS padding, label and icon sizes, the fill and ink of each variant, the disabled opacity and the pressed dimming, behind the existing API; dialog actions keep their plain style and minimum heights still scale with the text size.
- iOS: filter chips are 44-point capsules with a neutral fill and the brand tint when selected, with iOS spacing, type and pressed dimming.
- FilterChip takes an optional `haptic` for a selection tick through the provider's haptics, on by default on iOS.
- Document general platform geometry and build validation in English and German.
- Keep guidance and compatibility independent of consuming applications.

## 1.0.1

- iOS: `Pressable` no longer hands NativeWind a style callback, which it dropped whenever a `className` was set. Chips, buttons and other pressables keep their radii, heights and colours.
- iOS: `TopBar` puts Liquid Glass on its controls instead of a full-width band: the back button is a glass disc, the title and the actions each sit in a glass capsule. Its glass shares one group, so a pressed control swells and flows into its neighbour. With `floating`, it lies over the screen with a scroll-edge fade under it; pad the content by `useTopBarInset()`.
- `@isoline-ui/native` now peers on the matching `@isoline-ui/react-native`, so `npm ci` resolves again.

## 0.1.0-alpha.2

- Add keyboard-aware inline panels, scroll-coordinated sheet frames and a full opening/closing lifecycle. Configure handle or whole-panel gestures through the theme.
- Support Reanimated shared progress values and custom indicator height; flatten the wave with reduced motion. Add square and gable shapes.
- Add labelled password inputs, keyboard insets, refresh controls, headers, back buttons, toolbars, split buttons, badges, settings rows, empty states, snackbars and expandable floating action menus.
- Allow native material backgrounds for headers/toolbars through the provider's surface adapter. Preserve haptic preferences, translated labels and caller styling.
- Extend typography roles and expose pure RGB/HSL/Lab helpers through the native theme subpath.
- Add usage documentation in English and German, gesture physics regression tests and worklet closure checks.

Install the paired UI and native archives for this version from GitHub Releases. Select expo-glass-effect with Expo for your SDK. Native code changes require a new development or application build.
