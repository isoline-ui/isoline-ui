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
`npm install ./vendor/isoline-ui-react-native-<version>.tgz ./vendor/isoline-ui-native-<version>.tgz`,
with the version the archives were packed at.
Commit the archives, package.json and lockfile so a clean `npm ci` works. Never
pair archives from different commits, even when their version strings match, and
switch back to the npm release once it contains the change.

## Package contents and setup

The tarball includes Metro TypeScript sources, generated declarations, the
NativeWind preset and licence notices. The app must still configure NativeWind,
scan the package source and mount IsolineProvider. Fonts, labels and haptic
preferences remain consumer responsibilities. See the package README.

## Making a release

1. While features land, describe each under `## Unreleased` at the top of
   `CHANGELOG.md`.
2. Pick the version: a new major version when something is removed or changed
   incompatibly, a minor version for additions, a patch version for fixes.
3. Run `npm run release -- <version>`, for example `npm run release -- 2.2.0`.
   It sets the version of both packages, the native package's peer on the UI
   package and the showcase's dependencies, renames `## Unreleased` to the
   version, regenerates the lockfile and runs `npm run check` and
   `npm run docs:check`.
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
