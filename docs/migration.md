# Consumer migration

The initial package is extracted locally; no consumer imports are switched yet.

1. Add the versioned package, NativeWind preset/content scan and a theme adapter.
2. Start with simple shared primitives and keep existing app import paths as
   forwarding modules, so feature code does not churn.
3. Verify each app's native peer versions and preserve its settings, fonts,
   translations, dynamic palettes and haptic preference.
4. Reconcile APIs and layout semantics before moving complex buttons or sheets.
5. Run the consumer's typecheck, tests and Android/iOS exports. Gesture,
   accessibility and keyboard behaviour also need real device validation.

Keep mail transports, collectors, canvas/pins, data access, brand artwork,
screens and routes inside the apps. No public package imports an app alias.
Use explicit package versions or immutable commit references, never a moving
Git branch for shipped app builds.
