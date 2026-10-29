# 06: Today and Practice tabs

**Status:** ready-for-agent

**Blocked by:** 05

## What to build

- **Today:**
  - greeting and Exam Date countdown
  - Daily Goal ring and Streak
  - continue button
  - an unfinished Attempt to resume
  - Domain cards
  - Mistakes and Bookmarks shortcuts
- **Practice:**
  - Free Practice per Domain
  - Targeted Drill picker with accuracy per Focus
  - Mistakes Review
  - Bookmarks list
  - entries for Timed Section and Exam Simulation

## Acceptance criteria

- [ ] Every Mode can be started from the Practice tab, and Today's continue button starts the Domain it recommends.
- [ ] Counts update live after practicing.
- [ ] Empty states read well (no Mistakes, no Bookmarks, no Exam Date).

## Comments

The Targeted Drill picker is built. The "תרגול ממוקד" section of the Practice tab opens `src/app/drill.tsx` per Domain, where the learner ticks one or more Focuses, each showing how many of its Questions were answered and the accuracy.
