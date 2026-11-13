# Distribution without npmjs

Isoline test packages are attached to GitHub prereleases as `.tgz` files created
by `npm pack`. Each tarball is a package under `packages/react-native` or `packages/native`, not a
GitHub source archive of the entire monorepo.

## Install the documented 2.1.0 development source

The current API is a development source version, not a published release asset.
Historical alpha.0/alpha.1 archives do not include the current catalogue.

```sh
git clone https://github.com/isoline-ui/isoline-ui.git
cd isoline-ui
git rev-parse HEAD
npm ci --ignore-scripts
npm run check
npm run pack
```

Record the commit and use it for subsequent builds. Copy the resulting archives
into the consuming app's `vendor/` directory. From the app:

```sh
npm install ./vendor/isoline-ui-react-native-2.1.0.tgz
```

For optional native appearance, install the matching native archive too:

```sh
npm install ./vendor/isoline-ui-native-2.1.0.tgz
npx expo install expo-glass-effect
```

Commit the archives, package.json and lockfile. A clean CI checkout can then run
`npm ci`. Ordinary dependencies still come from the configured registry. Keep
native peers selected by the consuming Expo SDK. Never pair archives from different
commits simply because their development version strings match.

Once an authorized immutable release exists, its versioned GitHub asset URLs can
replace the local archives. Do not invent an asset URL before uploading a release.

## Package contents and setup

The tarball includes Metro TypeScript sources, generated declarations, the
NativeWind preset and licence notices. The app must still configure NativeWind,
scan the package source and mount IsolineProvider. Fonts, labels and haptic
preferences remain consumer responsibilities. See the package README.

## Release rules

- Build and check the package before packing; use a new tag/version for updates.
- Attach the archive and SHA256SUMS to a prerelease targeting its source commit.
- Do not replace a published archive or move a release tag.
- This distribution step is independent of npm publishing.

## Automated prereleases

The Publish prerelease workflow builds and checks a selected source ref, packs
the package, uploads the archive and SHA256SUMS, then publishes the prerelease.
It uses GitHub's repository token; no npm account or stored upload token is
needed. The initial workflow push bootstraps the first release. Later releases
are started from Actions → Publish prerelease → Run workflow after a version bump.

Only prerelease versions are accepted. A published version is left unchanged.
If an upload partially fails, the workflow does not replace existing assets;
inspect the draft before retrying.

The native archive also includes Expo autolinking configuration and Android
Kotlin/Gradle sources. See [native appearance](native.md) for rebuild requirements
and migration. Native support is optional: install only the UI archive if the app
does not use native appearance.
