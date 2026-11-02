# Consumer migration

Use the paired versioned UI/native archives from GitHub Releases. Keep existing app imports as thin forwarding modules during migration.

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

## Expanded catalogue and app adapters

The three consumers already forward their base UI primitives to Isoline. The
remaining reusable presentations now have explicit contracts: Avatar, Checkbox,
Slider, ActionChip, date/time/color pickers, AmountField, Banner/InlineNotice,
UndoBar, ZoomableImage, SwipeableRow and list/settings layout controls.

Keep contact/avatar lookups, agenda load calculations, undo queues/deadlines,
locale stores, data writes and routing in consumer adapters. Replace local
presentation while keeping existing feature import paths and callback timing.
In particular, time pickers keep drafts until confirmation, calendars retain
ranges and custom day marks, and informational undo countdowns continue under
reduced motion.

Register MaterialGroup alongside MaterialSurface when enabling native glass
groups. Update both archives, their lockfile integrities and archive checksums
together. Alpha.3 snapshots are not an npm release. Every public component is
tracked by the documentation coverage check; component pages require both a
React Native example and a rendered live preview in English and German.
