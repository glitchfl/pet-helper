# 08: Attempt engine (Timed Section and Exam Simulation)

**Status:** ready-for-agent

**Blocked by:** 03, 07

## What to build

A headless Attempt engine (spec > Attempts):
- create, start a Section, select or clear, flag, and track time per Question
- remaining time from the wall clock, with auto-finish on expiry
- finish a Section (lock it and write Responses)
- results with scoring

Persisted through the attempts store, so the Attempt can be resumed.

## Acceptance criteria

- [ ] Tests cover expiry while away, locking, answer changes, Responses on finish (none for unanswered Questions), resuming and results.
