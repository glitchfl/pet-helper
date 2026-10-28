# 09: Attempt screens

**Status:** ready-for-agent

**Blocked by:** 05, 08

## What to build

- Exam and Section pickers.
- The Section runner:
  - countdown with 5- and 1-minute warnings
  - pager in printed order
  - Question grid with answered, flagged and open states
  - finish confirmation
  - keep-awake
- The pause screen between Sections.
- Results:
  - raw score per Section
  - Score Estimate when the Exam has tables
- A review screen that pages through the Questions with your answer and the Correct Option.
- Resume from Today.

## Acceptance criteria

- [ ] An Exam Simulation runs four Sections end to end and shows the estimate.
- [ ] Killing the app mid-Section and reopening it resumes with the right remaining time, or with the Section finished if time ran out.
- [ ] Review works from the results, the Recap and Bookmarks.
