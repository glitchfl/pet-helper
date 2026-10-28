# 09: Bank Check

**Status:** ready-for-agent

**Blocked by:** 01 (Tracer: answer a sample Question on your phone)

## What to build

The test suite checks the structure of the shipped Question Bank, so extraction mistakes fail the run before they reach anyone's phone.

## Acceptance criteria

- [ ] The check runs over every Exam in the shipped Question Bank as part of the test suite.
- [ ] It fails when:
  - a Section's Question count is wrong for its Domain (23 for Verbal, 20 for Quantitative); sample Exams are exempt from this rule
  - a Question doesn't have exactly four Options
  - a Correct Option is outside 1–4
  - a Question has no Correct Option
  - a Question Set's members aren't consecutive
  - a Question Type is missing
  - a Quantitative Question has no Topic
  - a referenced image file doesn't exist
  - two items share an id
- [ ] Each rule has a test that feeds it a deliberately broken bank and sees it fail.
- [ ] The sample bank passes.
