# RTL is forced in the layout, not taken from the phone

The app is Hebrew-only, so it must be laid out right-to-left on every phone. The usual switch is the `forcesRTL` option of the expo-localization config plugin, but it only takes effect in a native build. iPhone users run the app in Expo Go, which ignores it, and Expo Go also resets `I18nManager.forceRTL` at runtime. On an English-language iPhone the whole app came out mirrored.

So the app forces the direction itself:

- The root view sets the Yoga `direction: 'rtl'` style, which flows down the whole layout tree, including screens, sheets and header items. On Android the same style also sets the native views' layout direction.
- `LocaleProvider direction="rtl"` from expo-router flips the native stacks, including the push animation and the back-swipe edge.
- The native tab host gets `direction: 'rtl'` through `unstable_nativeProps`, because on iOS it follows the native app's direction otherwise.

Text alignment follows the Yoga direction on both platforms, so text is never given `textAlign: 'right'`, which would mean *end*. Fabric swaps `left` and `right` styles according to the *system* direction, so they mean different things on different phones. Layout therefore uses only `start` and `end`, and horizontal transforms multiply by the `FORWARD` sign in `src/ui/motion.ts`.

Native controls that RN doesn't lay out, such as switches and date pickers, still follow the phone's own direction. That is accepted.

Since ADR 0005 the app no longer runs in Expo Go, so `forcesRTL` takes effect as well. The forced layout stays, so the direction never depends on it.
