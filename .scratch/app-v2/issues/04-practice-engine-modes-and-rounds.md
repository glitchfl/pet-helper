# 04: Practice Engine — Modes, Rounds and Recap

**Status:** ready-for-agent

**Blocked by:** 03

## What to build

Generalise the v1 engine into a Practice Session over a Selection (spec > Modes and the Practice Engine):
- Free Practice, Targeted Drill (by one or more Focuses), Mistakes Review and Bookmarks
- tiered ordering
- Rounds planned with a target of 10 and a cap of 13
- a Recap per Round

Update GLOSSARY.md with the new terms.

## Acceptance criteria

- [ ] Tests cover each Selection, tier order, partial Question Sets, Round planning, no immediate repeat, skips and the Recap.
- [x] The v1 behaviours (unseen first, Sets kept together in Free Practice, skip leaves Unseen) still pass.

## Comments

Targeted Drill landed ahead of this ticket, on the v1 engine without Rounds. `start(domain, focus)` serves only the picked Focuses, `focuses(domain)` lists a Domain's Focuses biggest first, and `progress(domain, focus)` narrows the counts. Rounds and the Recap still need to cover it when this ticket is built.

Rounds, the Recap and the Mistakes Review landed on the v1 engine. `start(domain, mode)` takes a Mode (`free`, `drill` with its Focuses, or `mistakes`) and plans the first Round, `round()` gives its progress, `recap()` is set once the Round's last Question is passed, and `nextRound()` plans the next one. Both return false when the Mode has nothing left to serve. A skip now stays Unseen until the next Round, since a Round is planned when it starts. Bookmarks are still missing, because they need the `bookmarks` table from 03.
