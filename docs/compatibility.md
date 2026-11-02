# Compatibility

Initial targets:

| Consumer | Expo | React Native | React |
| -------- | ---- | ------------ | ----- |
| Yours    | 57   | 0.86         | 19.2  |
| Inboki   | 58   | 0.88         | 19.3  |
| Atlas    | 58   | 0.88         | 19.3  |

Peer ranges express intended compatibility, not proof of every intermediate
version. The component showcase is the integration surface. Native iPhone
and Android interaction checks are required before a stable release.

The optional `@isoline-ui/native` package supplies an Android Expo module and
an iOS glass adapter. Native peers, including `expo-glass-effect`, must be
installed using the version selected by each consuming Expo SDK. See [native
appearance](native.md).

## Local verification

- The package typecheck, declaration build, pure tests and boundary tests pass
  with the Expo 58 / React Native 0.88 dependency set.
- The Expo 58 showcase bundles for both iOS and Android.
- The earlier alpha.2 package sources were checked against Yours' Expo 57 native peer type
  definitions. This does not replace an Expo 57 native build or device test.
- The three apps already install paired vendored alpha.2 archives and forward
  their shared primitives to Isoline. The alpha.3 catalogue requires refreshed
  paired archives, adapter updates and consumer checks. Native device validation
  remains necessary; an app dependency update is not a native interaction test.
