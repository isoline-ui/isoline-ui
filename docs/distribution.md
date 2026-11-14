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

## How releases happen

Releases are automatic; nobody edits a version number.

1. **Pull request titles are conventional commits**, and a pull request is
   squash-merged, so its title becomes the commit on `main`. The type decides
   the next version:
   - `fix: …` or `perf: …`: a patch release (2.1.0 → 2.1.1);
   - `feat: …`: a minor release (2.1.0 → 2.2.0);
   - `feat!: …`, or a `BREAKING CHANGE:` line in the description: a major
     release (2.1.0 → 3.0.0);
   - `docs:`, `chore:`, `refactor:`, `test:`, `ci:`, `build:` and `style:`
     release nothing on their own.

   The Pull request title check holds every title to this.

2. **release-please keeps a release pull request open** (the Release workflow,
   `.github/workflows/release-please.yml`). After each merge to `main` it updates
   that pull request: the next version, the changelog generated from the merged
   titles, and the version written into both packages, the native package's
   peer, the showcase and the lockfile (`release-please-config.json`). Edit its
   changelog text if a line needs better wording.
3. **Merging the release pull request is the release.** The workflow tags
   `vX.Y.Z`, creates the GitHub release, runs the checks and publishes
   `@isoline-ui/react-native`, then `@isoline-ui/native`, to npm.

Publishing uses [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers):
npm trusts that one workflow file through GitHub's OIDC token, so there is no npm
token in the repository or its secrets, and every published version carries a
provenance statement. A re-run skips a version that is already on npm. Never
republish or change a published version; release a new one instead. The
documentation names no version numbers, so a release needs no documentation
changes.

### One-time setup

- On npmjs.com, for **each** package (Settings → Trusted publishing → GitHub
  Actions): organisation or user `isoline-ui`, repository `isoline-ui`, workflow
  `release-please.yml`, no environment. Once a release has gone through, set
  "Require two-factor authentication and disallow tokens" there.
- In the repository, Settings → Actions → General → Workflow permissions: allow
  GitHub Actions to create pull requests, so release-please can open its pull
  request.
- In Settings → General → Pull Requests, allowing only squash merging keeps one
  conventional commit per pull request on `main`.
- To publish a version that `main` already carries but npm does not have (the
  first release with this workflow, or one whose publishing failed), run
  Actions → Release → Run workflow on `main`. It publishes the packages' current
  version and skips any already on npm.

Pull requests that GitHub Actions opens do not trigger other workflows, so the
release pull request shows no CI checks; the publish job runs the full checks
itself before it publishes.

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
