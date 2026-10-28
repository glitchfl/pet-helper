# 11: First Approved Exam: Verbal

**Status:** ready-for-agent

**Blocked by:** 04 (Passage Question Sets), 07 (NITE markings, attribution and dark mode), 09 (Bank Check)

## What to build

The newest Approved Exam's two Verbal Sections (46 Questions) are live in the app in place of the sample Verbal content.

This ticket builds the reusable extraction toolkit (Python with PyMuPDF). It pulls Question numbers, Options, the Answer Key, and Passages with their line-marker positions. Hebrew punctuation and bracket order are fixed in the session from page renders. The toolkit also produces a Proof Sheet for the owner to skim.

## Acceptance criteria

- [ ] Precondition: the project owner has accepted NITE's public-use form and supplied the list of Approved Exams.
- [x] Before building on them, the template facts are re-checked against this Exam's PDF: Sections, Question counts, Answer Key page.
- [x] The extraction script pulls out:
  - Question numbers and Options, telling Passage line numbers apart from Option markers by horizontal position
  - the Answer Key
  - Passage text with the positions of its line markers
  - text hidden by accessibility "ActualText" overrides
- [x] Bracket order and sentence-final punctuation in Hebrew are corrected against the rendered page.
- [x] Every Verbal Question is tagged with its Question Type (NITE's heading).
- [x] A Proof Sheet for the Verbal Sections shows each Question as the app displays it next to its PDF crop, and the owner has skimmed it.
- [x] The 46 Questions are in the shipped Question Bank, the Bank Check passes, and the sample Verbal content is gone.
- [x] Verbal Free Practice in the app serves this Exam.

Human steps: supplying the approved list, and skimming the Proof Sheet.

## Comments

- 2026-10-28: done except the human steps - the owner supplied Autumn 2026 without the approved list, and the Proof Sheet at `proof/autumn-2026/index.html` still needs a skim. State, verified facts and next steps are in `.scratch/free-practice-v1/handoff-11-12.md`.
- 2026-10-28: the owner skimmed the Proof Sheet and confirmed it.
