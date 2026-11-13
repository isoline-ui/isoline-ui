# Design contract

Share semantic colours, component structure, emphasis and accessibility rules.
Control geometry follows the selected platform.
Consumers define their own identity through theme values and typography.

- Android keeps contained ripples; iOS receives pressed-opacity feedback.
- Native switches keep OS geometry and use semantic brand colours.
- BackIcon uses a chevron on iOS; route handling belongs to the consumer.
- Sheet dismissal has an accessible Close action and an explicit handle gesture.
- Dialogs support safe areas, keyboard avoidance and scrollable form contents.
- Honour system text scaling, reduced motion and platform accessibility.
- The optional `@isoline-ui/native` package provides native Liquid Glass through
  `MaterialSurface`. Solid surfaces remain available on unsupported systems and
  when Reduce Transparency is enabled.
- Android system palettes are provided by the same native package through
  `useSystemTheme`; app preferences and persistence remain consumer contracts.

A successful bundle is not a device interaction test. Before release, verify
VoiceOver/TalkBack focus, keyboard placement, large text, interrupted gestures,
light/dark contrast and nested overlays on Android and iOS.

When migrating sheets, compare scroll coordination, keyboard handling and
dismissal semantics before replacing an existing implementation.

## Platform geometry and integration

A shared layout still needs platform control geometry. Buttons and filter
chips use iOS capsules behind the same API;
Android retains M3 Expressive. App-specific accent roles stay in consumer themes.

Use Liquid Glass for floating controls through the native surface adapter,
with solid fallback for unsupported systems and Reduce Transparency. A floating
`TopBar` needs `useTopBarInset()` on its content; do not turn it on globally
without migrating screen padding. Tab labels can cap scaling locally, while
reading text and forms must remain scalable. Device-test contrast over photos,
long translations, keyboard placement and accessible names.

Build readiness is separate: align all Expo dependencies to the consumer's SDK
and run `expo install --check` in CI. Incompatible precompiled native modules
can produce an archive that crashes at launch with a missing symbol. A Metro bundle cannot
prove native ABI compatibility. Compile on macOS and cold-launch the signed or
re-signed IPA on a phone before calling the native port validated.
