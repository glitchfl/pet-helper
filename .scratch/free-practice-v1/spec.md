# PET Helper v1: Free Practice on iPhone and Android

**Status:** ready-for-agent

## Problem Statement

From December 2026 the PET is a two-domain exam: Verbal and Quantitative. NITE's practice Exams are the best preparation material, but they only come as A4 PDFs. Practicing from them on a phone means pinching and zooming. Checking a Response means scrolling to the Answer Key at the back. Nothing remembers which Questions you've already done or which ones you got wrong. With dozens of Exams and roughly 86 multiple-choice Questions in each, the material can't be used in short, relaxed sessions on the go.

## Solution

A free, public iPhone and Android app that turns NITE's Approved Exams into a Question Bank you can practice one tap at a time. In v1 there is a single Mode, Free Practice (תרגול חופשי):

- You pick a Domain and get one Question at a time with its four Options. Unseen Questions come first, then your Mistakes.
- A Passage or Chart stays together with all of its Questions.
- Tapping an Option shows at once whether it was right and which Option is correct. You press Next when you're ready.
- Every Response is saved on the phone. The home screen shows simple counts per Domain.
- The interface is Hebrew, right-to-left, and follows the phone's light/dark setting.
- Math is properly typeset, and Figures and Charts are shown as images.
- NITE's watermark, copyright line and required attribution notice are always visible, as its public-use license requires.

## User Stories

### Choosing what to practice

1. As a learner, I want to choose Verbal or Quantitative on the home screen, so that I practice the Domain I want right now.
2. As a learner, I want the home screen to show how many Questions in each Domain I've seen out of the total, so that I know how much of the bank I've covered.
3. As a learner, I want the home screen to show my percentage correct per Domain, so that I can see how I'm doing.
4. As a learner, I want the home screen to show how many Mistakes I have to retry per Domain, so that I know what's waiting for me.
5. As a learner, I want the interface in Hebrew and right-to-left, so that it feels natural next to Hebrew exam material.
6. As a learner, I want the app to follow my phone's light/dark setting, so that practicing at night is comfortable.

### Answering Questions

7. As a learner, I want to see one Question at a time with its four Options, so that I can focus.
8. As a learner, I want the Options in NITE's original order, so that Options that refer to each other ("both (1) and (2)") still make sense and match the exam.
9. As a learner, I want to tap an Option and see immediately whether it was right, so that I learn while the Question is fresh.
10. As a learner, I want the Correct Option highlighted when I got it wrong, so that I see what the answer was.
11. As a learner, I want the Options locked once I've responded, so that I can't fix my answer after seeing the correct one.
12. As a learner, I want to move on with a Next button instead of auto-advancing, so that I can stay on a wrong answer as long as I need.
13. As a learner, I want to skip a Question without answering, so that I'm not forced to guess when I'd rather come back to it.
14. As a learner, I want a skipped Question to stay unseen, so that it comes back later instead of counting as a Mistake.
15. As a learner, I want Options that are images (e.g. graphs as answers) to be tappable like text Options, so that every Question works the same way.

### What comes next

16. As a learner, I want Unseen Questions served before anything else, so that I cover the whole bank.
17. As a learner, I want my Mistakes served once I've seen everything, so that I retry what I got wrong.
18. As a learner, I want practice to keep going after Mistakes are done, so that I can always do one more.
19. As a learner, I want a Mistake to stop counting once I answer it correctly, so that the retry list shrinks as I improve.
20. As a learner, I want the order within each priority to be random, so that I don't practice whole Exams in their printed sequence.
21. As a learner, I want the same Question or Question Set not to come up twice in a row, so that practice doesn't feel stuck.

### Passages, Charts and Figures

22. As a learner, I want a Passage and all its Questions served as one block, so that I read the Passage once and answer all of them.
23. As a learner, I want the Passage to wrap to my phone's width, so that I can read it without sideways scrolling.
24. As a learner, I want small line markers where original lines 5, 10, 15… begin, so that I can find "(שורה 12)" in the wrapped text.
25. As a learner, I want to get back to the Passage while answering its Questions, so that I can check details.
26. As a learner, I want a Chart and all its Questions served together, so that I study the Chart once and answer all of them.
27. As a learner, I want Figures and Charts shown as clear images, so that geometry and graph Questions are answerable.
28. As a learner, I want Figures and Charts on a light card in dark mode, so that black-on-white drawings stay legible.
29. As a learner, I want fractions, roots, exponents and π properly typeset, so that Quantitative Questions read like the exam.
30. As a learner, I want a Formula Sheet button during Quantitative practice, so that I have the same reference as in the real exam.

### Progress and data

31. As a learner, I want every Response saved on my phone, so that my progress survives closing the app.
32. As a learner, I want a Response saved the moment I tap, so that nothing is lost if I leave in the middle of a Question Set.
33. As a learner, I want the app to work fully offline, so that I can practice on the bus or in a dead zone.
34. As a learner, I want my data to stay on my phone with no account, so that there's nothing to sign up for.

### Reporting mistakes in the bank

35. As a learner, I want a "report a mistake" button on every Question, so that I can flag a garbled formula or a suspicious Correct Option.
36. As a learner, I want the report to open a GitHub issue already filled in with the Exam, Section and Question number, so that reporting takes seconds.

### Installing and updating

37. As a learner on iPhone, I want to open the app through Expo Go, so that I don't need a paid Apple developer account.
38. As a learner on Android, I want to install the app as a regular APK, so that it launches like any other app.
39. As a learner, I want new Exams and fixes to arrive over the air, so that I don't have to reinstall.

### Building the Question Bank (maintainer)

40. As the maintainer, I want only Approved Exams in the Question Bank, so that the app stays within NITE's public-use license.
41. As the maintainer, I want a script to pull Question numbers, Options and the Answer Key out of an Exam PDF, so that the reliable parts need no hand work.
42. As the maintainer, I want the script to crop every Figure and Chart from the PDF at high resolution, so that drawings stay sharp on any screen.
43. As the maintainer, I want math and Hebrew punctuation fixed in a session by reading the rendered page, so that text the PDF garbles is still correct in the bank.
44. As the maintainer, I want every Question tagged with its Question Type (NITE's heading), so that later Modes can filter by type.
45. As the maintainer, I want every Quantitative Question tagged with a Topic, so that a later "weak topics" Mode has data.
46. As the maintainer, I want each Passage to record where original lines 5, 10, 15… start, so that the app can draw line markers.
47. As the maintainer, I want the Formula Sheet extracted with each Exam, so that the Quantitative practice screen can show it.
48. As the maintainer, I want a Proof Sheet per Exam showing each extracted Question next to its PDF crop, so that I can review the whole Exam in one skim.
49. As the maintainer, I want the Bank Check to fail the test run when the bank's structure is broken, so that bad data never ships.
50. As the maintainer, I want to add a new Approved Exam without changing app code, so that adding content is only a data change.
51. As the maintainer, I want to push bank updates over the air, so that learners get fixes quickly.

### License compliance (maintainer)

52. As the maintainer, I want NITE's watermark and copyright line drawn behind every Question card, so that the license's "no removing markings" condition is met.
53. As the maintainer, I want NITE's attribution notice shown verbatim in the app and in the README, so that every use carries the required notice.
54. As the maintainer, I want the repo public and the app free, so that the use is "free and open to the general public" as the license requires.

### Development

55. As a developer, I want all Free Practice logic in a headless Practice Engine, so that it can be tested without rendering screens.
56. As a developer, I want the engine's clock, randomness and Response store injected, so that tests are deterministic.

## Implementation Decisions

### Platform and distribution
- Expo with TypeScript, one codebase for iOS and Android.
- iPhone runs the app through Expo Go, so no paid Apple Developer Program is needed.
- Android gets an APK built with EAS Build.
- Bank and app updates ship over the air with EAS Update.
- The repo is public on GitHub as `pet-helper`.

### Content rules (see ADR 0001 and ADR 0002)
- The Question Bank contains only Approved Exams.
- English and the Writing Task are excluded.
- No explanations: the app only reveals the Correct Option.
- Options keep NITE's printed order and are never shuffled.
- Questions are stored as native Hebrew text with math as LaTeX. Only Figures, Charts, image Options and the Formula Sheet are images.
- NITE's watermark and copyright line are drawn behind every Question card.
- The attribution notice is shown verbatim in the app and the README.

### Question Bank (data contract between extraction and app)
- One data file per Exam plus its image assets, bundled into the app. The app loads every Exam in the bank, so adding an Exam needs no code change.
- An Exam has an id (season and year), its Sections, its Formula Sheet image, and its Question Sets.
- A Section has its number within the Exam and its Domain.
- A Question has:
  - a stable id built from Exam, Section and Question number
  - its printed number
  - its Question Type, using NITE's heading
  - a Topic, for Quantitative Questions only
  - a stem
  - exactly four Options, each either rich text or an image
  - its Correct Option (1–4)
  - an optional Figure
  - an optional Question Set reference
- A Question Set has an id, a kind (Passage or Chart), and the ordered ids of its Questions, which are always consecutive in the Section.
  - A Passage stores its text plus where each original line marker (5, 10, 15…) begins.
  - A Chart stores its image.
- Rich text is Hebrew text with inline LaTeX segments for math. Text direction is right-to-left.

### Practice Engine (headless TypeScript module, test seam 1)
- Constructed from the Question Bank, a Response store, a clock and a source of randomness.
- **Interface:**
  - start Free Practice for a Domain
  - get the current Question Set (or standalone Question)
  - respond to a Question with an Option, which returns whether it was correct and the Correct Option
  - skip a Question
  - advance to the next Question Set
  - get progress for a Domain
- **Practice unit:** the engine serves a Question Set as one unit. A standalone Question is a unit of one. The whole unit is served even if some of its Questions were already answered.
- **Ordering:** each unit falls into one of three tiers, ordered randomly within each tier:
  1. contains an Unseen Question
  2. contains a Mistake
  3. everything else

  The unit just served is never served again immediately, unless it's the only unit.
- **Responding:** a Response records the Question, the chosen Option, whether it was correct, when it was answered, and how long it took (from when the Question was shown).
  - Responses are append-only, and a Question can collect many over time.
  - Only the most recent Response decides whether the Question is a Mistake.
- **Skipping:** a skip records nothing, so the Question stays Unseen.
- **Progress for a Domain:**
  - seen: Questions with at least one Response, out of the total in the Domain
  - percentage correct: across seen Questions, using each one's most recent Response
  - Mistakes: number of Questions still to retry

### Response store
- A small append-and-read-all interface.
- In the app it's on-device SQLite. In tests it's in memory.
- No sync and no accounts.

### Screens (thin layer over the Practice Engine)
- **Home:** two Domain buttons with progress counts, and access to the attribution notice.
- **Practice:**
  - a Question card with the watermark and copyright line, and four Options
  - after a Response, right/wrong feedback with the Correct Option highlighted, Options locked and a Next button
  - a Skip action and a "report a mistake" action
  - in the Quantitative Domain, a Formula Sheet button
- **Question Sets:** the Passage is wrapped to screen width with inline line markers and stays reachable while answering its Questions. A Chart is shown with its Questions.
- **Appearance:**
  - Hebrew, right-to-left
  - light/dark follows the system
  - Figures and Charts sit on a light card
  - math rendered from LaTeX
- **Report a mistake:** opens GitHub's new-issue page for the public repo, prefilled with the Exam, Section, Question number and app version.

### Extraction toolkit (Python with PyMuPDF, run in Claude Code sessions)
These facts come from analyzing six recent two-domain Exam PDFs. Re-check them against the Approved Exams.
- **Layout:** every Exam uses the same template:
  - two Verbal Sections of 23 Questions
  - two Quantitative Sections of 20 Questions
  - the Answer Key on one page as four tables
  - a Formula Sheet page opening each Quantitative Section
- **Structure parse:**
  - Question numbers are bold and sit at the right margin.
  - Options are marked "(1)"–"(4)".
  - Passage line numbers look exactly like Option markers and can only be told apart by horizontal position.
  - The PDFs' accessibility tags help with the parse.
  - One Exam needs its accessibility "ActualText" overrides ignored to recover hidden text.
- **Math:** the text layer loses √, fraction bars and π, and maps some Greek letters to Latin ones. Every Quantitative stem and Option is retyped as LaTeX from the rendered page during the session.
- **Hebrew:** the text layer flips brackets and moves sentence-final punctuation, and these get fixed during the session.
- **Answer Key:** parsed from its page and cross-checked against the Question count of each Section.
- **Figures and Charts:** cropped from the vector PDF at high resolution.
- **Proof Sheet:** generated per Exam as an HTML page showing each Question as the app would display it next to its PDF crop. A person skims it once per Exam.
- **Rollout:** the first Approved Exam goes all the way into the app before the rest are extracted.

### Bank Check (test seam 2)
Runs in the test suite over the real Question Bank and fails on:
- a Section whose Question count is wrong for its Domain
- a Question without exactly four Options
- a Correct Option outside 1–4
- an incomplete Answer Key
- Question Set members that aren't consecutive
- a missing Question Type, or a Quantitative Question without a Topic
- a referenced image that doesn't exist
- a duplicate id

## Testing Decisions

- **What a good test looks like:** it drives a public interface and asserts behavior the learner would notice: which Questions are served next, what feedback a Response returns, what progress shows. It never asserts internal data structures. Clock and randomness are injected so every run is deterministic.
- **Practice Engine (seam 1):** tested with a small hand-written fixture bank and the in-memory Response store. The behaviors to cover:
  - Unseen first, then Mistakes, then the rest
  - a Question Set is served whole and stays together
  - a skip leaves a Question Unseen
  - a correct later Response clears a Mistake
  - the just-served unit isn't repeated while alternatives exist
  - the progress counts: seen, percentage correct by most recent Response, Mistakes
  - Responses capture correctness and how long the answer took
- **Bank Check (seam 2):** runs over the real committed bank, so extraction mistakes fail the run before shipping.
- **Not tested automatically:**
  - Screens are a thin layer over the engine and are checked by hand on a real iPhone and Android phone.
  - The extraction scripts aren't tested directly. Their output goes through the Bank Check and the Proof Sheet.
- **Prior art:** none, since the repo is empty. Use Jest, Expo's default test runner.

## Out of Scope

- The English Domain and the Writing Task (essays, sample essays, essay prompts).
- Explanations or worked solutions.
- Other Modes: exam simulation, timed Sections, a dedicated Mistakes review, weak-topic drills, practice by Question Type.
- Any timer, score screen, score estimation or score-conversion tables.
- Accounts, a backend, or syncing between devices.
- App Store and Google Play listings, TestFlight, and a paid Apple Developer account.
- Shuffling Options.
- Tap-to-jump from a line reference in a Question to the Passage.
- Exams that are not on NITE's public-use approved list.

## Further Notes

- **Blocking:** which Exams are approved is only visible after accepting NITE's public-use consent form, a binding agreement with 100,000 ₪ in agreed damages. The project owner accepts it personally and supplies the list. Extraction can't start until then. App and engine work can start immediately against the fixture bank.
- The approved PDFs may be different files from the six that were analyzed. Confirm the template facts on the first Approved Exam before scaling up.
- NITE's license lets NITE require being told how its material is used, and lets it change or withdraw the terms with notice. The attribution and watermark rules live in ADR 0001.
- The domain vocabulary is in GLOSSARY.md. Decisions are in ADR 0001 (only Approved Exams, public, attributed, no English) and ADR 0002 (native text with images only for Figures and Charts).
