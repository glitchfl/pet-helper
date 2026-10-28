// formulas typeset at build time by scripts/build-math.mjs (ADR 0003)

type MathFile = {
  glyphs: string[];
  math: Record<string, { w: number; a: number; d: number; svg: string }>;
};

// sizes are in em of the surrounding text: ascent above the baseline, descent below it
export type MathBox = { width: number; ascent: number; descent: number; svg: string };

const mathFiles = require.context('../../bank', true, /\/math\.json$/);

const sources = new Map<string, MathFile>();
for (const key of mathFiles.keys()) {
  const file = mathFiles(key) as MathFile;
  for (const latex of Object.keys(file.math)) if (!sources.has(latex)) sources.set(latex, file);
}

const boxes = new Map<string, MathBox>();

export function mathBox(latex: string): MathBox | undefined {
  const cached = boxes.get(latex);
  if (cached) return cached;
  const file = sources.get(latex);
  if (!file) return undefined;

  const { w, a, d, svg } = file.math[latex];
  // glyph outlines are stored once per exam and referenced as d="@index"
  const box = { width: w, ascent: a, descent: d, svg: svg.replace(/d="@(\d+)"/g, (_, index) => `d="${file.glyphs[Number(index)]}"`) };
  boxes.set(latex, box);
  return box;
}
