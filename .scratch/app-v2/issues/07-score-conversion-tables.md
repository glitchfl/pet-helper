# 07: Score conversion tables and scoring

**Status:** ready-for-agent

## What to build

- Extract the raw → scaled and weighted → general tables from the four 2025 PDFs into each `exam.json` under `scoring`.
- Add a scoring module that turns raw scores into the estimates.
- Extend the Bank Check for the tables.

## Acceptance criteria

- [ ] Each PDF's own worked example reproduces in a test.
- [ ] The Bank Check validates the table lengths, the monotonic 50–150 scales and the contiguous general ranges.
- [ ] Autumn 2026, which has no PDF in the repo, has no `scoring`, and the app handles that.
