# 01: Tracer: answer a sample Question on your phone

**Status:** ready-for-agent

**Blocked by:** None (can start immediately)

## What to build

Open the app in Expo Go on an iPhone, pick Verbal on the home screen and get a Question with its four Options. Everything is in Hebrew, right-to-left. Tap an Option and see whether it was right, with the Correct Option highlighted and the Options locked. Press Next to get another Question.

The content is a small hand-written sample Question Bank that follows the spec's data contract. A headless Practice Engine serves it. This is the thinnest end-to-end path through bank, engine, screens and tests.

## Acceptance criteria

- [ ] The Expo + TypeScript app launches in Expo Go on an iPhone.
- [ ] The interface is Hebrew and right-to-left.
- [ ] The home screen shows a Verbal button and a Quantitative button.
- [ ] A sample Question Bank exists with a handful of standalone Questions in each Domain, following the spec's Question shape (stable id, printed number, Question Type, stem, exactly four Options, Correct Option). Sample Exams are marked as samples.
- [ ] The Practice Engine is a headless module built from the bank, a Response store, a clock and a source of randomness.
- [ ] The engine can start Free Practice for a Domain, return the current Question, accept a Response, and advance.
- [ ] Responding returns whether the Response was correct and which Option is correct.
- [ ] After a Response the Options are locked and the Correct Option is highlighted. A wrong Response is marked as wrong.
- [ ] A Next button advances, and there is no auto-advance.
- [ ] Options always appear in their printed order.
- [ ] Responses go to an in-memory store for now.
- [ ] Jest runs, and engine tests cover feedback for a correct and a wrong Response.
