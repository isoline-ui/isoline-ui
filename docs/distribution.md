# Distribution without npmjs

Isoline test packages are attached to GitHub prereleases as `.tgz` files created
by `npm pack`. Each tarball is a package under `packages/react-native` or `packages/native`, not a
GitHub source archive of the entire monorepo.

## Install

```sh
npm install https://github.com/isoline-ui/isoline-ui/releases/download/v0.1.0-alpha.1/isoline-ui-react-native-0.1.0-alpha.1.tgz https://github.com/isoline-ui/isoline-ui/releases/download/v0.1.0-alpha.1/isoline-ui-native-0.1.0-alpha.1.tgz
npx expo install expo-glass-effect
```

Commit both package.json and the lockfile in each app. npm records the release
URL and the package integrity in the lockfile. A clean CI checkout can then use
`npm ci`; no npm account or Isoline npm organisation is needed.

The other package dependencies still come from the configured npm registry.
Do not upgrade native peers to arbitrary latest versions: retain the versions
selected by the consuming Expo SDK.

A downloaded archive also works:

```sh
npm install ./vendor/isoline-ui-react-native-0.1.0-alpha.1.tgz
```

For a local-file dependency, commit the archive or otherwise make the same path
available in CI. The GitHub URL is preferable for testing across all three apps.

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
