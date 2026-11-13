# Distribution

Released versions of `@isoline-ui/react-native` and `@isoline-ui/native` are
published to npm:

- https://www.npmjs.com/package/@isoline-ui/react-native
- https://www.npmjs.com/package/@isoline-ui/native

```sh
npm install @isoline-ui/react-native
npm install @isoline-ui/native   # optional native appearance, same version
npx expo install expo-glass-effect
```

Install both packages at the same version and commit the lockfile.

## Installing an unreleased commit

To try changes that are not on npm yet, build local archives from one reviewed
commit:

```sh
git clone https://github.com/isoline-ui/isoline-ui.git
cd isoline-ui
git rev-parse HEAD
npm ci --ignore-scripts
npm run check
npm run pack
```

Copy the resulting archives into the consuming app's `vendor/` directory and
install them from the app, for example
`npm install ./vendor/isoline-ui-react-native-2.0.0.tgz ./vendor/isoline-ui-native-2.0.0.tgz`.
Commit the archives, package.json and lockfile so a clean `npm ci` works. Never
pair archives from different commits, even when their version strings match, and
switch back to the npm release once it contains the change.

## Package contents and setup

The tarball includes Metro TypeScript sources, generated declarations, the
NativeWind preset and licence notices. The app must still configure NativeWind,
scan the package source and mount IsolineProvider. Fonts, labels and haptic
preferences remain consumer responsibilities. See the package README.

## Release rules

- Build and check the package before packing; use a new tag/version for updates.
- Attach the archive and SHA256SUMS to a prerelease targeting its source commit.
- Do not replace a published archive or move a release tag.

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
