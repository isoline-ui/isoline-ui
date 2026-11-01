# Native appearance

`@isoline-ui/react-native` contains the reusable components and theme contract.
`@isoline-ui/native` adapts native appearance to that contract. It does not own
app stores, routing, translations or preferences.

Android system palette reading and the pure role/interpolation logic were
extracted from Yours' existing `expo-system-colors` and `dynamic-color.ts`.
The mapping includes the original tinted surfaces; it is opt-in and preserves
brand typography and semantic error/success roles. NativeWind variables and
literal native/SVG colors derive from the same resolved theme.

On iOS we reuse Expo's native glass implementation. We do not add a redundant
Swift implementation. The `.ios.tsx` surface checks native API availability,
Liquid Glass availability and Reduce Transparency. Other platforms use the
solid implementation. All components retain their ordinary shared appearance
unless the consumer explicitly uses a MaterialSurface.

## Verification

`npm run check` builds declarations, checks exports, tests color interpolation
and malformed native data, and installs the real native `.tgz` into a temporary
consumer. Expo Autolinking must discover the scoped Android package with the
expected Kotlin class and Gradle source directory, and exclude it on Apple.
The check is repeated by CI and before release packaging.

The showcase can be exported with `npm run export:ios --workspace
isoline-showcase` and the Android equivalent. `npx expo prebuild --no-install`
in the showcase generates projects for native compilation. Neither autolinking
nor Metro export is a native compilation or a device test.

Before production use, test a development build on Android 12+ with wallpaper
changes and on an older Android fallback. On iOS 26+ inspect the material over
scrolling content, toggle Reduce Transparency, check light/dark appearance,
VoiceOver and touch interaction; also test an older iOS fallback. This Linux
workspace cannot run Xcode or an iOS simulator.

## Consumer migration

Install the paired prerelease archives and `npx expo install expo-glass-effect`.
Keep SDK-selected peer versions. Replace the app's palette reader with
`useSystemTheme(baseTheme, useSystemColorsPreference)` at its IsolineProvider.
Keep the scheme, brand, preference persistence and font loading in the app.
Remove old local modules only after all imports are migrated. Add MaterialSurface
to selected UI surfaces; native stack navigation and tabs remain separate
platform integrations. The three production apps are not automatically migrated
by installing these packages.
