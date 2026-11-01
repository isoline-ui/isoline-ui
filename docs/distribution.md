# Distribution without npmjs

Isoline test packages are attached to GitHub prereleases as `.tgz` files created
by `npm pack`. The tarball is the package under `packages/react-native`, not a
GitHub source archive of the entire monorepo.

## Install

```sh
npm install https://github.com/isoline-ui/isoline-ui/releases/download/v0.1.0-alpha.0/isoline-ui-react-native-0.1.0-alpha.0.tgz
```

Commit both package.json and the lockfile in each app. npm records the release
URL and the package integrity in the lockfile. A clean CI checkout can then use
`npm ci`; no npm account or Isoline npm organisation is needed.

The other package dependencies still come from the configured npm registry.
Do not upgrade native peers to arbitrary latest versions: retain the versions
selected by the consuming Expo SDK.

A downloaded archive also works:

```sh
npm install ./vendor/isoline-ui-react-native-0.1.0-alpha.0.tgz
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
