# 12: First Approved Exam: Quant

**Status:** ready-for-agent

**Blocked by:** 05 (Quant display: math, Figures, image Options, Formula Sheet), 06 (Chart Question Sets), 11 (First Approved Exam: Verbal)

## What to build

The same Exam's two Quantitative Sections (40 Questions) are live in the app in place of the sample Quant content. This extends the extraction toolkit with:
- Figure, Chart and image-Option crops
- retyping every stem and Option as LaTeX from the rendered page
- a Topic tag for each Question
- the Formula Sheet

## Acceptance criteria

- [x] Figures, Charts and image Options are cropped at high resolution from the vector PDF.
- [x] Every Quantitative stem and Option is retyped as LaTeX from the rendered page. The text layer is never trusted for math.
- [x] Every Quantitative Question has a Question Type (NITE's heading) and a Topic.
- [x] The Formula Sheet is extracted and opens from the Formula Sheet button.
- [x] A Proof Sheet for the Quantitative Sections exists, and the owner has skimmed it.
- [x] The 40 Questions are in the shipped Question Bank, the Bank Check passes including the count rules, and the sample Quant content is gone.

Human step: skimming the Proof Sheet.

## Comments

- 2026-10-28: done except the owner's skim of `proof/autumn-2026/index.html`. Chart Sets gained an optional `text` (NITE's explanatory paragraph) - the Chart Questions can't be answered without it. Crop rectangles live in `scripts/extract/crops/autumn-2026.json`.
- 2026-10-28: the owner skimmed the Proof Sheet and confirmed it.
