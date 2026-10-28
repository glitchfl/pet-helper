# 04: Passage Question Sets

**Status:** ready-for-agent

**Blocked by:** 02 (Saved Responses and Free Practice ordering)

## What to build

When Free Practice reaches a reading Passage, you get the Passage and all of its Questions as one block. You read it once and answer them in a row. The Passage wraps to the phone's width. Small grey markers show where original lines 5, 10, 15… begin, so references like "(שורה 12)" can still be found. You can get back to the Passage while answering any of its Questions.

## Acceptance criteria

- [ ] The sample bank gains at least one Verbal Passage Question Set. Its Passage stores its text and where each original line marker begins.
- [ ] The engine treats a Question Set as one unit and serves all of its Questions in printed order.
- [ ] The whole Set is served even if some of its Questions were already answered.
- [ ] A Set's tier comes from its Questions:
  - Unseen, if any Question in it is Unseen
  - otherwise Mistake, if any Question in it is a Mistake
  - otherwise the rest
- [ ] The no-repeat rule applies to whole units, so a Set is never served twice in a row while alternatives exist.
- [ ] The Passage wraps naturally with inline line markers, and it stays reachable while answering each of its Questions.
- [ ] Engine tests cover a Set served whole and in order, the tiering of a Set, and a partly answered Set.
