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

- [ ] On an English-language phone, Hebrew text is right-aligned, rows start on the right, the back gesture and push animation come from the right, and Today is the rightmost tab.
- [ ] The same holds on an Android APK with `forcesRTL`.
- [ ] Light and dark both look intentional, and the override switches immediately.
- [ ] Presses scale with a spring, and haptics fire through one helper that a setting can turn off.
- [ ] Typecheck and tests pass.
