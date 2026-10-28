# 03: Home screen progress counts

**Status:** ready-for-agent

**Blocked by:** 02 (Saved Responses and Free Practice ordering)

## What to build

Under each Domain button, the home screen shows how far along you are: Questions seen out of the total, percentage correct, and how many Mistakes are waiting.

## Acceptance criteria

- [ ] The engine reports progress per Domain:
  - Questions with at least one Response, out of the total
  - percentage correct across seen Questions, using each one's most recent Response
  - the number of Mistakes
- [ ] The home screen shows these counts for each Domain and refreshes them when you come back from practice.
- [ ] Engine tests cover the counts, including a Mistake that was later answered correctly and a skipped Question.
