# Compatibility

Intended framework targets:

| Expo SDK | React Native | React |
| -------- | ------------ | ----- |
| 57       | 0.86         | 19.2  |
| 58       | 0.88         | 19.3  |

Peer ranges express intended compatibility, not proof of every intermediate
version. The component showcase is the integration surface. Native iPhone
and Android interaction checks are required before a stable release.

The optional `@isoline-ui/native` package supplies an Android Expo module and
an iOS glass adapter. Native peers, including `expo-glass-effect`, must be
installed using the version selected by the consuming Expo SDK. See [native
appearance](native.md).

## Verification

- Package typechecks, declaration builds, pure tests and boundary tests run
  against the showcase's Expo 58 / React Native 0.88 dependency set.
- The Expo 58 showcase is exported for both iOS and Android.
- Earlier package sources were also checked against Expo 57 / React Native 0.86
  peer types. This does not establish an SDK 57 native build or device result.
- Each consumer must verify its own dependency graph, native build and device
  interactions. Installing or updating a package does not validate that integration.
