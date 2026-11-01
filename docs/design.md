# Design contract

Share semantic colours, component structure, shapes and accessibility rules.
Keep the three product identities distinct through theme values and typography.

- Android keeps contained ripples; iOS receives pressed-opacity feedback.
- Native switches keep OS geometry and use semantic brand colours.
- BackIcon uses a chevron on iOS; route handling belongs to the consumer.
- Sheet dismissal has an accessible Close action and an explicit handle gesture.
- Dialogs support safe areas, keyboard avoidance and scrollable form contents.
- Honour system text scaling, reduced motion and platform accessibility.
- Liquid Glass is a future optional material adapter. Solid surfaces must remain
  available on unsupported systems and when Reduce Transparency is enabled.

A successful bundle is not a device interaction test. Before release, verify
VoiceOver/TalkBack focus, keyboard placement, large text, interrupted gestures,
light/dark contrast and nested overlays on Android and iOS.

Atlas currently has more developed SheetFrame/PanelSheet scroll coordination.
Reconcile those behaviours explicitly before migrating its sheets; do not
replace them with the simpler alpha sheet.
