# 07: NITE markings, attribution and dark mode

**Status:** ready-for-agent

**Blocked by:** 01 (Tracer: answer a sample Question on your phone)

## What to build

The app meets NITE's public-use license conditions (ADR 0001, ADR 0002):
- every Question card shows NITE's watermark faintly behind it, plus NITE's copyright line
- NITE's attribution notice appears verbatim in the app and in the README

The app also follows the phone's light/dark setting, and the markings stay visible in both.

## Acceptance criteria

- [ ] NITE's watermark is drawn faintly behind every Question card.
- [ ] NITE's copyright line appears on every Question card.
- [ ] The attribution notice from ADR 0001 can be reached from the home screen, word for word.
- [ ] The README contains the same notice.
- [ ] Light/dark follows the phone setting. Text, watermark and copyright line are legible in both.
