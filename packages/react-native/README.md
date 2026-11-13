# @isoline-ui/react-native

Expressive shared UI with platform-aware interaction.

[![npm](https://img.shields.io/npm/v/@isoline-ui/react-native)](https://www.npmjs.com/package/@isoline-ui/react-native)

## Install

```sh
npm install @isoline-ui/react-native
```

The historical GitHub alpha archives have a different API.

## Consumer setup

Install the package and the peer dependencies
matching your Expo SDK. Use `npx expo install` for native peers; do not install
a second React or React Native runtime.

Keep the usual NativeWind Babel/Metro configuration. Add the Isoline preset and
package source to Tailwind's content scan:

```js
const path = require('node:path');
const ui = path.dirname(require.resolve('@isoline-ui/react-native/package.json'));

module.exports = {
  presets: [require('@isoline-ui/react-native/nativewind')],
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}', path.join(ui, 'src/**/*.{ts,tsx}')],
};
```

Do not overwrite an app's custom fonts or additional semantic roles; extend
the preset in the consumer. Font loading belongs to the consuming application.

```tsx
import { IsolineProvider, Button, themes } from '@isoline-ui/react-native';

export function App() {
  return (
    <IsolineProvider theme={themes.violet.light} labels={{ close: 'Schließen' }}>
      <Button
        label="Speichern"
        onPress={() => {
          /* app action */
        }}
      />
    </IsolineProvider>
  );
}
```

Place the provider inside the app's SafeAreaProvider and GestureHandlerRootView.
It paints CSS roles for NativeWind and supplies matching colours for native/SVG
props. Use a theme matching the app's light/dark preference.

`extendTheme` returns a new theme from token and typography overrides. Token
values are HSL channel triplets, not full CSS colour expressions. Dynamic
Material You roles and persisted text preferences are supplied through consumer adapters.

Haptics are opt-in: pass `haptics={{ selectionHaptic, impactHaptic }}` from the
app so its saved preference is honoured. Labels are similarly supplied from
the app's translations. There is no navigation or persistence dependency.

## Packaging

`react-native` and default exports point to TypeScript source for Metro.
`types` point to generated declarations. This is a React Native/Metro package;
plain Node/browser UI imports are not a supported distribution target.
Pure helpers can be imported from `@isoline-ui/react-native/tokens`.

The package intentionally does not install Expo, native runtimes, app fonts
or native model/scanner integrations. Native dependency changes require a
new native app build, not only an OTA update.

## iOS, Android and browsers

Controls follow the native OS automatically. The `platform="ios" | "android"`
provider prop selects a browser preview style and is inherited by nested providers;
it never changes the native device platform. Use Expo web with React Native Web,
React DOM, NativeWind and the normal native peers. The repository showcase includes
`npm run web --workspace isoline-showcase` and `export:web`.

Register `surfaceComponent={MaterialSurface}` and
`surfaceGroupComponent={MaterialGroup}` on `IsolineProvider` using the optional
`@isoline-ui/native` adapters. Core UI works without Expo using solid fallbacks.

The shared `MaterialOptions` contract (`material`, `glassStyle`, `tintColor`,
`fallbackColor`, `interactive`) supports buttons/icon buttons, search, segmented
controls, pickers, floating/split actions, toolbars, navigation, tabs, popovers,
context menus and optional overlay surfaces. `TabBar` is controlled; routing
remains in the app. `Popover` anchors, flips and clamps a scrollable panel.
Context menus and pickers support disabled and selected options. Action menus
also support destructive actions.

Navigation and anchored menus default to automatic material. Form/action controls,
dialogs, sheets and snackbars default to solid; opt in per surface. Android stays
solid Material UI. iOS uses native glass where available and respects Reduce
Transparency. `SurfaceGroup` uses native `GlassContainer` to blend nearby glass
surfaces and can animate `gap`, respecting reduced motion. Browser groups animate
spacing only: CSS backdrop blur approximates glass without native merging or
refraction. Use a contrasting background to make translucency visible.

The new controls require native/device verification in consumer builds; browser
checks and Metro exports do not verify UIKit rendering or accessibility.
