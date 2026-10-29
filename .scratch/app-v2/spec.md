# PET Helper v2: a complete practice app

**Status:** ready-for-agent

## Problem Statement

v1 proved the Question Bank and the Free Practice engine, but as an app it isn't usable yet:

- On iPhone the layout is mirrored. Expo Go ignores the `forcesRTL` config plugin setting, so unless the phone itself is set to Hebrew, the Hebrew UI is laid out left-to-right.
- Quantitative Questions lag and jump. Every math segment opens its own WebView with ~200 KB of inlined KaTeX fonts, up to five per Question, and each one resizes after it loads.
- The practice flow is clunky. A session never ends, there is no sense of progress, and the Passage tabs and bottom bar feel unfinished.
- There is one Mode, no statistics, no goals, no way to practice under exam conditions, and the app icon is still Expo's template.

## Solution

A calm, native-feeling Hebrew app with four tabs (Today, Practice, Progress, Settings) and five Modes:

- **Free Practice** — one Domain, unseen first, then Mistakes, in Rounds of about 10 with a Recap.
- **Targeted Drill** — one Question Type or one Topic, same Rounds.
- **Mistakes Review** — only your Mistakes, until none are left.
- **Timed Section** — one Section against a 20-minute clock under real-exam rules.
- **Exam Simulation** — a whole Exam, four timed Sections, then a Score Estimate from NITE's own conversion tables.

Answering in the practice Modes is select-then-Check. Around them: Bookmarks, a Stats screen, an Exam Date countdown, a Daily Goal with a Streak, and a Daily Reminder. Math is typeset natively, RTL works on every phone, and every interaction has smooth motion and haptics.

## User Stories

### It works everywhere

1. As a learner on an English-language iPhone, I want the app laid out right-to-left, so that Hebrew reads naturally.
2. As a learner, I want Quantitative Questions to appear instantly with their math in place, so that nothing flickers or jumps.
3. As a learner, I want fractions of Hebrew phrases (e.g. "area of the square / area of the triangle") laid out as real fractions that wrap on narrow phones.

### Navigating

4. As a learner, I want four tabs — Today, Practice, Progress, Settings — in the phone's native tab bar, so that the app feels like a first-party app.
5. As a learner, I want a short first-launch setup (Exam Date, Daily Goal, Reminder) that I can skip.

### Today

6. As a learner, I want to see the days left to my Exam Date.
7. As a learner, I want my Daily Goal progress and my Streak at a glance.
8. As a learner, I want one button that continues practicing where it makes sense.
9. As a learner, I want my coverage, accuracy and Mistakes per Domain.
10. As a learner, I want to resume an unfinished Timed Section or Exam Simulation from the Today tab.

### Practice Modes

11. As a learner, I want Free Practice per Domain in Rounds of about 10 Questions, so that sessions have a natural end.
12. As a learner, I want a Recap after each Round (right, wrong, skipped, time) with the option to review what I missed, continue, or stop.
13. As a learner, I want to drill one Question Type (e.g. analogies) or one Topic (e.g. geometry), with my accuracy shown next to each.
14. As a learner, I want a Mistakes Review that serves only my Mistakes until none remain.
15. As a learner, I want to Bookmark any Question and later practice or browse my Bookmarks.

### Answering

16. As a learner, I want to select an Option and press Check, so that a mis-tap doesn't cost me.
17. As a learner, I want clear feedback after Check: the Correct Option, my wrong choice if any, a haptic, and motion that feels good.
18. As a learner, I want to skip a Question, and have it stay Unseen.
19. As a learner, I want a progress bar for the current Round.
20. As a learner, I want to tap a Figure or Chart to zoom into it.
21. As a learner, I want the Passage one tap away while answering its Questions.
22. As a learner, I want the Formula Sheet one tap away in Quantitative practice.
23. As a learner, I want to report a mistake in the bank from any Question.

### Exam conditions

24. As a learner, I want a Timed Section: one Section of an Exam, 20 minutes, Questions in printed order.
25. As a learner, I want an Exam Simulation: all four Sections of an Exam back to back, 20 minutes each, with a pause screen between Sections.
26. As a learner, I want to move freely within the current Section, change my answers, and flag Questions to revisit.
27. As a learner, I want a grid of the Section's Questions showing answered, flagged and open ones.
28. As a learner, I want the clock to keep running if I leave the app, and the Section to end on its own when time is up.
29. As a learner, I want a finished Section locked, as in the real exam.
30. As a learner, I want to resume an unfinished Attempt after the app was closed.
31. As a learner, I want the screen to stay awake during a timed Section.
32. As a learner, I want results only at the end: raw score per Section and, for an Exam Simulation, a Score Estimate (Verbal, Quantitative and the general multi-domain, verbal-emphasis and quant-emphasis ranges).
33. As a learner, I want to review every Question of a finished Attempt against the Correct Option.
34. As a learner, I want answers given in an Attempt to count as Responses, so that its Mistakes join my Mistakes Review.

### Progress

35. As a learner, I want my activity over the last two weeks against my Daily Goal.
36. As a learner, I want accuracy per Question Type and per Topic, weakest first, each with a shortcut to drill it.
37. As a learner, I want my average time per Question per Domain.
38. As a learner, I want the history of my Attempts with their scores.

### Settings

39. As a learner, I want to set my Exam Date and Daily Goal.
40. As a learner, I want a Daily Reminder at a time I choose.
41. As a learner, I want to override light/dark, make Question text larger, and turn haptics off.
42. As a learner, I want to reset my progress.
43. As a learner, I want the NITE attribution notice and the source code link.

### Maintainer

44. As the maintainer, I want math typeset at build time, so that the app ships no math engine and adding an Exam stays a data change plus one script.
45. As the maintainer, I want each Exam's score conversion tables in its `exam.json`, checked by the Bank Check.

## Implementation Decisions

### Platform constraints
- The app is installed as its own build, not run in Expo Go (ADR 0005): a Release build from Xcode with the free Personal Team on iPhone, an EAS APK on Android.
- Native modules aren't limited to Expo Go's set any more, but each one needs new builds on both phones. The planned ones are react-native-svg, Reanimated 4, Gesture Handler 3, expo-haptics, expo-symbols, expo-notifications, expo-keep-awake and the community date picker.
- expo-notifications runs with `enableRemoteNotifications: false`, because the free Personal Team can't sign push notifications.

### RTL (ADR 0004)
- The layout direction is forced in the app, not taken from `I18nManager`:
  - `LocaleProvider direction="rtl"` from expo-router flips the native stack, which also covers the push animation and the back-swipe edge.
  - Every screen root sets the Yoga `direction: 'rtl'` style.
- Text alignment follows the Yoga direction on both platforms, so `textAlign` is left at its default. `'right'` would mean *end*.
- Horizontal offsets use `start`/`end`, never `left`/`right`.
- The native tab bar is the only part that follows the system direction. When `I18nManager.isRTL` is false, its tabs are declared in reverse, so that Today still sits on the right.

### Math (ADR 0003)
- `scripts/build-math.mjs` typesets every LaTeX segment with MathJax into SVG and writes `bank/<exam>/math.json`, keyed by style and LaTeX.
  - A segment that is the whole paragraph is typeset in display style. One inside a sentence is typeset in text style.
- The app draws each one with react-native-svg as an inline view inside native `Text`, so bidi and line-breaking stay native.
- A top-level `\frac` whose numerator or denominator holds `\text{…}` is laid out natively as a fraction of two rich-text lines, with the rest of the segment typeset as math.
- The WebView, KaTeX and `react-native-webview` are removed.

### Modes and the Practice Engine
- **Practice Unit:** a Question Set or a standalone Question, as before.
  - A Selection filters each Unit's Questions by a predicate and drops Units that end up empty.
  - In a Targeted Drill or the Mistakes Review, a Question Set may therefore be served with only some of its Questions, always with its Passage or Chart.
- **Tiers:** Free Practice, Targeted Drill and Bookmarks order Units as unseen, then containing a Mistake, then the rest, randomly within a tier. Mistakes Review serves only Mistakes.
- **Rounds:** a Round is planned when it starts.
  - Units are added in tier order until the Round holds at least 10 Questions.
  - A Unit that would push it past 13 is held back, unless the Round is still empty.
  - The Unit that closed the previous Round is not served first in the next one.
- **Recap:** the Responses and skips of the Round, its duration, and the list of Questions for review.
- **Responses:** recorded at Check, with the time since the Question was shown, exactly as in v1.

### Attempts (Timed Section and Exam Simulation)
- An Attempt is created for an Exam and a list of Section numbers: one for a Timed Section, all four in printed order for an Exam Simulation.
- **Timing:**
  - Each Section lasts 20 minutes, the time NITE prints on every Section.
  - The remaining time is computed from the wall clock when the Section started, so leaving the app doesn't stop it.
  - An expired Section is finished as timed out the next time the Attempt is touched.
- **State:** the current Section, selections, flags and per-Question time are saved to SQLite on every change.
- **Finishing a Section:**
  - It is locked.
  - Each answered Question becomes a Response, with the time spent on it as `durationMs`.
  - Unanswered Questions record nothing, so they stay Unseen.
- **Scoring:**
  - Raw score per Domain = correct answers in its two Sections.
  - Scaled score = the Exam's raw → scaled table.
  - Weighted scores are (V+Q)/2, (3V+Q)/4 and (V+3Q)/4.
  - The general estimate is the range the Exam's weighted → general table gives.
  - Exams without tables show raw scores only.

### Score conversion tables
- `exam.json` gains:
  ```
  scoring: {
    scaled: { verbal: number[], quantitative: number[] },   // indexed by raw score
    general: { weighted: [min, max], general: [min, max] }[]
  }
  ```
- They are extracted from the "חישוב אומדן ציוני הבחינה" pages of the PDF.
- The Bank Check verifies:
  - `verbal` has 47 entries (raw 0–46) and `quantitative` has 41 (raw 0–40).
  - Both are non-decreasing from 50 to 150.
  - The general table covers 50–150 without gaps.

### Persistence
- One SQLite database, migrated by `PRAGMA user_version`, with these tables:
  - `responses` (unchanged)
  - `bookmarks`
  - `attempts` (JSON state)
  - `settings` (key → JSON)
- An app-level store loads everything at startup and notifies React through `useSyncExternalStore`, so every tab updates live.

### Goals and reminders
- The Daily Goal counts Responses made on the local calendar day.
- The Streak counts consecutive days that met the goal, ending today or, if today isn't met yet, yesterday.
- The Daily Reminder is a local repeating notification, rescheduled whenever its settings change.

### Look and feel
- Calm and native:
  - grouped backgrounds, white cards (elevated greys in dark), system font, SF Symbols / Material Symbols through expo-symbols
  - a single indigo accent, plus violet for Verbal and teal for Quantitative
- Light/dark follows the system unless overridden with `Appearance.setColorScheme`.
- **Motion:**
  - presses scale to 0.97 with a spring
  - Check reveals with a spring pop on the Correct Option and a shake on a wrong choice
  - Questions slide in from the reading direction
- **Haptics:**
  - selection: selection tick
  - Check: success or error notification
  - timer warnings at 5 and 1 minutes left
  - all of them can be turned off
- Practice sessions and Attempts are full-screen modals, the Formula Sheet is a sheet, and images open in a zoomable viewer.
- A real app icon and splash replace Expo's template.

## Testing Decisions

- Same philosophy as v1: tests drive public interfaces with an injected clock and randomness, and assert what a learner would notice.
- **Practice Engine:**
  - Selections per Mode
  - tier ordering
  - partial Question Sets in a Targeted Drill and the Mistakes Review
  - Round planning (target, cap, no immediate repeat)
  - the Recap
  - a skip leaves a Question Unseen
- **Attempts:**
  - the clock, including expiry while away and auto-finish
  - locking a finished Section
  - changing answers
  - Responses written on finish, with nothing for unanswered Questions
  - resuming from saved state
- **Scoring:** the worked example printed in each PDF (e.g. Winter 2025: V = 91 and Q = 138 give 555–580, 502–527 and 635–660).
- **Stats:**
  - accuracy per Question Type and Topic
  - daily counts across midnight
  - Streak edge cases
- **Bank Check:** the scoring tables and math coverage (every LaTeX segment has a rendered entry).
- Screens are checked by hand on the Android emulator and on the owner's iPhone.

## Out of Scope

- Explanations or worked solutions.
- Shuffling Options.
- Accounts, sync or a backend.
- English and the Writing Task.
- App Store and Play Store listings.
- Push notifications from a server.

## Further Notes

- The Autumn 2026 PDF isn't in the repo, so its conversion tables can't be extracted yet. Its Attempts show raw scores until the owner adds the PDF.
- ADR 0002 still holds: math is still typeset from LaTeX, only now at build time and drawn natively.
