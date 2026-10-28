# 02: Native math

**Status:** ready-for-agent

**Blocked by:** 01

## What to build

Replace the KaTeX WebViews with math typeset at build time (spec > Math, ADR 0003):
- `npm run build:math` writes `bank/<exam>/math.json` for every Exam.
- Rich text is rendered as native paragraphs with inline SVG math.
- A segment that fills its paragraph is shown in display style.
- Fractions of Hebrew phrases are laid out natively.
- The Bank Check fails when a LaTeX segment has no rendered entry.
- `react-native-webview` and `katex` are removed.

## Acceptance criteria

- [ ] A Quantitative Question appears in one frame, with no resizing after it shows.
- [ ] Inline math sits on the text baseline and doesn't collide with neighbouring lines.
- [ ] The five word-fraction stems wrap inside their numerator and denominator on a narrow phone.
- [ ] The Bank Check covers math, and the README explains the script.
