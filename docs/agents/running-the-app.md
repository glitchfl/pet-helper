# Running the app

Look at the app the way a learner meets it: a debug build in the iOS simulator or the Android emulator that loads its JS from Metro, so a saved change shows up through Fast Refresh with no rebuild. The app never runs in Expo Go (ADR 0005).

`scripts/device.mjs` drives both devices. Its commands are listed at its top.

## Steps

1. **Metro.** Start `npx expo start --dev-client` in the background and keep it running for the session. Done when `curl -s localhost:8081/status` prints `packager-status:running`.
2. **Devices.**
   - iOS: `xcrun simctl boot "iPhone 17 Pro"`.
   - Android: start `~/Library/Android/sdk/emulator/emulator -avd Medium_Phone_API_36.1 -no-snapshot-save -no-audio -no-boot-anim` in the background.
   - Done when `xcrun simctl list devices booted` lists the iPhone and `~/Library/Android/sdk/platform-tools/adb shell getprop sys.boot_completed` prints `1`.
3. **Build.** Only when the app is missing from a device, or the native side changed since it was built: a native module, `app.json` or the Expo SDK. The first build takes about 10 minutes, so run it in the background.
   - iOS: `CI=1 npx expo run:ios --device "iPhone 17 Pro" --no-bundler`
   - Android: `ANDROID_HOME=~/Library/Android/sdk CI=1 npx expo run:android --no-bundler`
   - Done when the command exits 0.
4. **Launch.** `node scripts/device.mjs <ios|android> launch`. Done when the Metro log prints `Bundled`.
5. **Look.** For every screen the change touches, reach it, take a `shot` into your scratchpad and Read it. Done when each one has been seen on both platforms, in light and in dark.

## Reaching a screen

- **Deep link:** `open <route>`, where the route is the file path under `src/app/` without the `(group)` folders, plus the screen's params as a query. For example, `session?domain=verbal`, `formula-sheet?exam=winter-2025` or `settings/about`. A link opened while a modal is up pushes its screen inside that modal, so `restart` first.
- **Taps:** Android only. `tree` lists what is on screen, and `tap` takes a text, an accessibility label or a point read off a shot. iOS has no tap driver, so walk a flow on Android, then reach the same screen on iOS by deep link or by seeding state.
- **State:** everything the learner did lives in one SQLite file. On iOS it is `$(xcrun simctl get_app_container booted com.glitchfl.pethelper data)/Documents/SQLite/pet-helper.db`. Read or seed it with `sqlite3`, then `restart`. On Android, `adb shell pm clear com.glitchfl.pethelper` wipes it.

The simulator and the emulator are set to English, which is the case the forced RTL layout has to survive (ADR 0004). A red error screen shows up in the shot itself. `console.log` output and bundling errors go to the Metro log.
