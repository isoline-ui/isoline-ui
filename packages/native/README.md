# @isoline-ui/native

Native system appearance for Isoline UI, distributed as an Expo module.

- Android 12+: reads the device's five Material You tonal palettes.
- iOS 26+: `MaterialSurface` uses native Liquid Glass through `expo-glass-effect`.
- Unsupported devices, a missing Android bridge and reduced transparency use solid theme surfaces.

Install **both** Isoline archives from the same GitHub prerelease, then let Expo
select the glass dependency for the app's SDK:

```sh
npm install https://github.com/isoline-ui/isoline-ui/releases/download/v0.1.0-alpha.1/isoline-ui-react-native-0.1.0-alpha.1.tgz https://github.com/isoline-ui/isoline-ui/releases/download/v0.1.0-alpha.1/isoline-ui-native-0.1.0-alpha.1.tgz
npx expo install expo-glass-effect
```

Keep the UI package's existing NativeWind and native peer setup. This package
supports Expo SDK 57 and 58; do not force the SDK 58 glass version into SDK 57.

```tsx
import { IsolineProvider, themes, Text } from '@isoline-ui/react-native';
import { MaterialSurface, useSystemTheme } from '@isoline-ui/native';

function AppContent() {
  // Supply your app's persisted preference and its active light/dark scheme.
  const theme = useSystemTheme(themes.yours.light, true);
  return (
    <IsolineProvider theme={theme}>
      <MaterialSurface style={{ borderRadius: 24, padding: 20 }}>
        <Text>A shared component with a platform material</Text>
      </MaterialSurface>
    </IsolineProvider>
  );
}
```

`useSystemTheme(base, enabled)` preserves typography and semantic error/success
colors. It refreshes the palette when the app becomes active and when system
appearance changes. The supplied base controls light/dark mode; preferences and
persistence remain app responsibilities. `getSystemPalette()` and
`useSystemPalette()` expose the validated raw palette for custom integrations.

`MaterialSurface` accepts View props plus `material: 'auto' | 'glass' | 'solid'`,
`fallbackColor`, `tintColor`, `glassStyle: 'regular' | 'clear'` and `interactive`.
Even explicit `glass` respects platform support and Reduce Transparency.
`interactive` enables native material interaction; add your own accessible
button to handle actions. Style glass with layout/radius/padding, avoiding opaque
backgrounds and opacity animations on the glass or its ancestors. Use it for
selected floating controls and navigation surfaces; it does not turn an entire
screen into a native toolbar, tab bar or SwiftUI control.

## Native linking and builds

The npm name `@isoline-ui/native` is scoped; the Kotlin namespace
`isoline.modules.systemcolors` and bridge name `IsolineSystemColors` are separate.
Expo discovers the module from `expo-module.config.json` in the installed package.
The archive contains the Android Gradle project and Kotlin sources. No manual
`nativeModulesDir` entry is required for this dependency.

The new bridge name allows coexistence with Yours' old `ExpoSystemColors` during
migration. Once consumers switch to the shared hook, remove their unused local
module and palette/theme logic. Do not copy the new native module into `modules/`
as well as installing it.

After adding or changing native dependencies, rebuild the development client or
app (`npx expo run:android`, `npx expo run:ios`, or EAS Build). For projects that
maintain native folders manually, follow their existing Gradle/CocoaPods workflow.
An OTA update cannot add native code: use an appropriate Expo runtime version.
Expo Go does not contain the custom Isoline Android module and uses the fallback.

The showcase and CI test source types, palette mapping, installed-tarball
Autolinking and Metro exports. These checks do not establish device rendering,
accessibility behavior or native compilation; see `docs/native.md`.
