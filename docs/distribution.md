# Releases

Isoline is published on npm as two packages that share one version number:
`@isoline-ui/react-native` (the UI) and `@isoline-ui/native` (the optional native
appearance), whose peer dependency expects the matching UI version. Each package
is built from `packages/react-native` or `packages/native`, not from the whole
monorepo.

## Install

```sh
npm install @isoline-ui/react-native
npm install @isoline-ui/native        # optional native appearance
npx expo install expo-glass-effect    # with the native package
```

Commit `package.json` and the lockfile so a clean `npm ci` installs the same
versions. Keep native peers selected by the consuming Expo SDK.

## Package contents and setup

The tarball includes Metro TypeScript sources, generated declarations, the
NativeWind preset and licence notices. The app must still configure NativeWind,
scan the package source and mount IsolineProvider. Fonts, labels and haptic
preferences remain consumer responsibilities. See the package README.

The native package also includes Expo autolinking configuration and Android
Kotlin/Gradle sources. See [native appearance](native.md) for rebuild
requirements. Install only the UI package if the app does not use native
appearance.

## Making a release

1. While features land, describe each under `## Unreleased` at the top of
   `CHANGELOG.md`.
2. Pick the version: a new major version when something is removed or changed
   incompatibly, a minor version for additions, a patch version for fixes.
3. Run `npm run release -- <version>`, for example `npm run release -- 2.2.0`.
   It sets the version of both packages, the native package's peer on the UI
   package and the showcase's dependencies, renames `## Unreleased` to the
   version with today's date, regenerates the lockfile and runs `npm run check`
   and `npm run docs:check`.
4. Commit, open a pull request and merge it once CI passes.
5. Publish from a clean checkout of `main`, the UI package first, since the
   native package's peer expects it:

   ```sh
   npm ci
   npm run build
   npm publish --workspace @isoline-ui/react-native
   npm publish --workspace @isoline-ui/native
   ```

Never republish or change a version once it is on npm; release a new version
instead. The documentation names no version numbers, so it needs no changes for
a release.

## GitHub prereleases

For a prerelease version (for example `2.2.0-alpha.1`), Actions → Publish
prerelease builds and checks a chosen ref and attaches both packages as `.tgz`
files and SHA256SUMS to a GitHub prerelease. It accepts only prerelease versions
and never replaces an existing asset.
