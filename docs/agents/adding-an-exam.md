# Adding an Exam

The owner hands over Exam PDFs. Take each one all the way into the shipped Question Bank yourself: one Exam at a time, one commit per Exam. The owner picks the Exams and trusts the extraction, so their only step is approving the over-the-air update at the end.

The commands are listed in `.venv/bin/python scripts/extract/extract.py --help`. Their order and the venv setup are in README > The Question Bank. `bank/autumn-2026/` is a finished Exam to compare against.

## Steps

1. **Ticket.** Add `.scratch/free-practice-v1/issues/NN-<exam-id>.md` for the Exam, using the next free number. Ticket 13 is the umbrella and its criteria are the per-Exam criteria.
2. **Exam id.** Read the cover's "מועד <season> <year>" and map it to `<season>-<year>`: אביב spring, קיץ summer, סתיו autumn, חורף winter. Done when `bank/<exam-id>/` does not exist yet. If it does, the Exam is already shipped: tell the owner and move to the next PDF.
3. **Template check.** Run `inspect`. Done when it prints no `PROBLEM` line. A `PROBLEM` means this PDF departs from the template. Change the scripts in `scripts/extract/` until `inspect` is clean on this PDF and still clean on `~/Downloads/Psychometric Exam Autumn 2026.pdf`.
4. **Verbal.**
   - Run `verbal`.
   - Render the Verbal pages with `pages` (page ranges come from `inspect`) and Read them.
   - Fix by hand any stem, Option or passage in `exam.json` that differs from its page. Every vowel-marked word needs this check (see Hand fixes).
   - Done when all 46 Questions and both passages have been compared with their pages.
5. **Quantitative.**
   - Render the Quantitative pages with `pages` and Read them.
   - Retype every stem and Option as LaTeX into a retyped file in your scratchpad (see Retyped file).
   - Pick every Figure, Chart, image Option and the Formula Sheet into `scripts/extract/crops/<exam-id>.json` (see Crops).
   - Run `crop`, then look at every image.
   - Run `quant`, then `apply`.
   - Done when `apply` reports no leftover keys and no raw-draft Questions, and every image shows the whole drawing with no stray print in it.
6. **Checks.** Done when `npm test` and `npm run typecheck` are green. The Bank Check runs over the real bank, so it catches counts, Topics, broken LaTeX and missing images.
7. **Proof Sheet.** Run `proof`. Commit it with the Exam and name the path `proof/<exam-id>/index.html` in your final message.
8. **Commit.** Commit once per Exam, with a message like `added the summer 2025 exam`.
9. **Update.** An over-the-air update reaches every learner. Once the batch is committed, ask the owner with AskUserQuestion, then run README > Publishing an update.
10. **Ticket.** Tick the criteria in the Exam's ticket and add a line under `## Comments`.

## Retyped file

A JSON object read by `apply`, built from the rendered page (the text layer garbles math):

- `"<section>-<question>"` maps to `{"topic", "stem", "options"}`, where `options` holds four rich texts. For a Question whose Options are images, omit `options`. `quant` already points those Options at their crops.
- `"<section>-chart<i>"` maps to the Chart's intro: NITE's paragraph that explains the Chart, ending with its "שימו לב" line.

### Rich text

- Math goes between `$` signs as LaTeX. A literal `$` is written `\$`, in text and in LaTeX alike, e.g. `$a \,\$\, b = 1$`.
- Hebrew inside math goes in `\text{}`.
- A ratio printed as `2 : 1` becomes `$2 : 1$`, which keeps the printed left-to-right order.
- Plain numbers and units stay text, e.g. `48 ס"מ`. The given data and the question go on separate lines with `\n`, as printed.
- Passage text is plain text with no `$` handling. `verbal` writes it as it should stay.

### Topics

Reuse this vocabulary: תורת המספרים, אלגברה, שורשים וחזקות, אחוזים, ממוצעים, בעיות תנועה, בעיות הספק, שברים ויחסים, גאומטריה, הסתברות, קומבינטוריקה, ניתוח נתונים (every Chart Question). A Question that fits none is the owner's call: ask before adding a Topic.

## Crops

- **Rectangles:** read them off the `pages` renders. Each render has a grid labelled every 50 points, and a pixel divided by 2.083 gives points.
- **Spec format:** `{"page": <PDF page number, 1-based>, "rect": [x0, y0, x1, y1]}` in points.
- **`blank`:** a list of rectangles painted white first. Use it for print that a rectangle can't avoid, like a printed `(2)` inside an image Option, or stem text beside a Figure.
- **Names:** `formula-sheet.png`, `s<section>-chart<i>.png`, `s<section>-q<n>-figure.png`, `s<section>-q<n>-option<k>.png`. `quant` links exactly these names.
- **Formula Sheet:** crop from "הערות כלליות" down through the formulas.
- **Charts:** crop the legend and any table along with the chart. The intro paragraph goes into the retyped file as text.
- **Where boxes come from:** Quantitative pages carry hidden artwork from other language editions in their vector data. So every rectangle comes from the renders.

## Hand fixes

The scripts already rebuild reading order from glyph positions, restore the fill-in blanks as `____`, read past accessibility ActualText, and whiten the watermark in crops. What the PDF leaves to you:

- **Vowel marks:** the PDF orders them inconsistently around their letters. List every vowel-marked word with the regex `\S*[֑-ׇ]\S*` and check each against a high-resolution crop of its line.
- **Bulleted givens:** a "נתון:" with bullet lines becomes `נתון:\n- …\n- …`.
- **Quotes:** a curly opening quote `“` becomes `"`.
