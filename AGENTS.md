# Isoline UI

Public shared React Native UI. Keep app data, routes, stores, credentials and
brand assets out of this repository.

- Theme, labels, fonts and haptics are consumer contracts.
- No `~/` imports, Expo Router or app persistence inside the package.
- React and native runtimes are peer dependencies.
- Keep worklet directives in the Metro sources and preserve declaration exports.
- Platform differences belong behind shared components or platform files.
- Keep source licence notices. New third-party artwork needs attribution.
- Run `npm run check` and the showcase Android/iOS bundle checks after changes.
- Do not publish an npm release before the organisation/scope and release
  authorisation are established. Never add tokens to workflows or source files.
- Do not describe a Metro export as an Xcode/device test.
