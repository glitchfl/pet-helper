# Installed builds instead of Expo Go

v1 ran on iPhone inside Expo Go, so that no paid Apple Developer account was needed. The price was a QR-code ritual to open the app, a ceiling of Expo Go's bundled native modules, and build-time config like `forcesRTL` being ignored. We now install the app as its own build on both phones, and still pay Apple nothing:

- **iPhone:** a Release build compiled on the owner's Mac and installed from Xcode, signed with the free Personal Team. A free signature lasts 7 days, so the build is reinstalled at least weekly, which keeps its data. Only phones the owner can connect to that Mac can get it.
- **Android:** an APK from EAS Build, sent as a file. EAS keeps the signing key, so every new APK installs over the old one without losing data.

Both still get new Exams and fixes over the air from EAS Update on the `production` channel. The runtime version is the native fingerprint, so an update only reaches builds whose native code it matches, and adding a native module means a new build on both phones.

A paid account would give TestFlight and installs on phones the owner never touches. It's worth revisiting if more iPhone users join.

A free Personal Team can't sign push notifications, so expo-notifications must run with `enableRemoteNotifications: false`. Local reminders still work.
