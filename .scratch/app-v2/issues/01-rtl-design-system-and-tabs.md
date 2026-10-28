# 01: RTL everywhere, design system and the four tabs

**Status:** ready-for-agent

## What to build

The foundation every later screen sits on:
- The app is laid out right-to-left on every phone, including an English-language iPhone in Expo Go (spec > RTL, ADR 0004).
- Design tokens for light and dark, with an appearance override.
- A small UI kit: text styles, card, button, pressable with spring scale, icon, list section and row, progress bar and ring, segmented control.
- Haptics behind one helper.
- Native tabs for Today, Practice, Progress and Settings, with placeholders where later tickets land.

## Acceptance criteria

- [x] On an English-language phone, Hebrew text is right-aligned, rows start on the right, the back gesture and push animation come from the right, and Today is the rightmost tab.
- [x] The same holds on an Android APK with `forcesRTL`.
- [ ] Light and dark both look intentional, and the override switches immediately.
- [ ] Presses scale with a spring, and haptics fire through one helper that a setting can turn off.
- [x] Typecheck and tests pass.

## Comments

- Verified on the Android emulator with an English system language: right-aligned text, rows starting on the right, back arrow on the right and Today as the rightmost tab, in both light and dark. iOS follows from the same mechanisms (ADR 0004) but still needs a look on the owner's iPhone.
- The appearance override and the haptics switch need the settings store, so they land with ticket 11. Both hooks are already in place: `Appearance.setColorScheme` drives `useColors`, and `setHapticsEnabled` gates every haptic.
