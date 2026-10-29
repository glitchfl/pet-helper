# 05: Practice session screen

**Status:** ready-for-agent

**Blocked by:** 02, 04

## What to build

The full-screen session used by every practice Mode:
- a top bar with close, Round progress, Bookmark and Formula Sheet
- the redesigned Question card
- select-then-Check, skip, feedback with motion and haptics
- Passage and Chart handling
- a zoomable image viewer
- report a mistake
- the Recap screen with review, next Round and finish

## Acceptance criteria

- [ ] Select, Check, Next and Skip work with the expected haptics, and nothing can be changed after Check.
- [ ] Questions slide in from the reading direction, and the Correct Option pops while a wrong choice shakes.
- [x] The Passage opens first for its first Question and stays one tap away.
- [ ] A Chart or Figure opens in a pinch-zoom viewer.
- [x] After a Round, the Recap shows right, wrong and skipped counts and the time, and lets you review the missed Questions.
- [x] The NITE watermark and copyright line stay on every Question card.

## Comments

Select-then-Check, Skip, the Round progress bar, the time taken after each Check and the Recap landed, checked on the Android emulator and the iOS simulator. The Recap also compares the average time per Question with the exam's pace (20 minutes over the Section's Questions). Haptics fire on select and Check but haven't been felt on a phone yet. Still to do: the close and Bookmark buttons in the top bar, the slide-in, pop and shake motion, and the zoom viewer.
