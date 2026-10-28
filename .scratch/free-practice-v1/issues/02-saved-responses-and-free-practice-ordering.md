# 02: Saved Responses and Free Practice ordering

**Status:** ready-for-agent

**Blocked by:** 01 (Tracer: answer a sample Question on your phone)

## What to build

Free Practice remembers you. Every Response is saved on the phone the moment you tap. Questions come in three tiers: Unseen Questions first, then your Mistakes, then everything else, randomly ordered within each tier. Skipping a Question leaves it Unseen. Close the app, reopen it, and the order still accounts for what you've done.

## Acceptance criteria

- [ ] Responses are stored in on-device SQLite and are append-only.
- [ ] Each Response records the Question, the chosen Option, whether it was correct, when it was answered, and how long it took from the moment the Question was shown.
- [ ] A Response is saved at the moment of the tap.
- [ ] Unseen Questions (no Response) are served before anything else.
- [ ] Mistakes (most recent Response wrong) come once no Unseen Questions are left, followed by everything else. Practice never ends.
- [ ] Answering a Mistake correctly removes it from the Mistakes.
- [ ] Order within a tier uses the injected randomness.
- [ ] The same Question is never served twice in a row unless it's the only one left.
- [ ] A Skip action exists. It records nothing, so the Question stays Unseen.
- [ ] Engine tests use the in-memory store, a fixed clock and seeded randomness, and cover each rule above.
- [ ] Checked by hand: answer a few Questions, kill the app, reopen it, and Unseen Questions still come first.
