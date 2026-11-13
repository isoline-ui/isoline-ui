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

Keep domain logic, data access, brand artwork, screens and routes inside the
consuming applications. No public package imports an app alias.
Use explicit package versions or immutable commit references, never a moving
Git branch for shipped app builds.

## 2.0.0

The deprecated theme aliases are gone. Replace them with the palette names, or
define the alias in the app:

| Removed         | Use             |
| --------------- | --------------- |
| `themes.inboki` | `themes.violet` |
| `themes.yours`  | `themes.teal`   |
| `themes.atlas`  | `themes.cyan`   |

On iOS, buttons and filter chips are now capsules at the iOS heights. An app
that drew its own iOS button or filter chip for that can use these instead.

## Expanded catalogue and app adapters

Use forwarding modules to adopt reusable presentations with explicit contracts: Avatar, Checkbox,
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
