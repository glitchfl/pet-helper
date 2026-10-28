# 03: Data layer, history and stats

**Status:** ready-for-agent

**Blocked by:** 01

## What to build

- A migrated SQLite database with these tables:
  - responses
  - bookmarks
  - attempts
  - settings
- An app store that loads it all at startup and drives React through `useSyncExternalStore`.
- A bank index (Questions by id, Units per Domain, Question Types and Topics).
- A history built from the Responses.
- A stats module:
  - progress per Domain, per Question Type and per Topic
  - average time
  - daily counts
  - Daily Goal and Streak

## Acceptance criteria

- [ ] An existing v1 database opens without losing Responses.
- [ ] Stats tests cover accuracy by most recent Response, daily counts across midnight and Streak edge cases.
- [ ] Answering on one tab updates the others with no manual refresh.
