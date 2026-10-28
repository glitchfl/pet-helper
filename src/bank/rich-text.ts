import type { RichText } from './types';

// shared by the app, the bank check and scripts/build-math.mjs, which imports it through node's type stripping -
// keep it free of runtime imports

export type RichSegment = { kind: 'text'; text: string } | { kind: 'math'; latex: string };

// one line of rich text. a line that holds nothing but one math segment is typeset on its own, in display style.
// a top-level fraction of hebrew phrases, optionally after a label like "נתון:", is laid out natively
// because mathjax cannot shape hebrew
export type Paragraph =
  | { kind: 'text'; segments: RichSegment[] }
  | { kind: 'math'; latex: string }
  | { kind: 'wordFraction'; lead: string; numerator: RichSegment[]; denominator: RichSegment[]; rest: string };

// \$ is a literal dollar sign - a lone $ opens or closes math
export function parseRichText(value: RichText): RichSegment[] {
  const segments: RichSegment[] = [];
  let buffer = '';
  let inMath = false;

  for (let i = 0; i < value.length; i++) {
    if (value[i] === '\\' && value[i + 1] === '$') {
      buffer += inMath ? '\\$' : '$';
      i++;
    } else if (value[i] === '$') {
      if (buffer) segments.push(inMath ? { kind: 'math', latex: buffer } : { kind: 'text', text: buffer });
      buffer = '';
      inMath = !inMath;
    } else {
      buffer += value[i];
    }
  }

  if (inMath) throw new Error(`unclosed $ in "${value}"`);
  if (buffer) segments.push({ kind: 'text', text: buffer });
  return segments;
}

// the brace group that opens at `open`, and the index of its closing brace
function readGroup(latex: string, open: number): { content: string; close: number } | undefined {
  if (latex[open] !== '{') return undefined;
  let depth = 0;
  for (let i = open; i < latex.length; i++) {
    if (latex[i] === '\\') i++;
    else if (latex[i] === '{') depth++;
    else if (latex[i] === '}' && --depth === 0) return { content: latex.slice(open + 1, i), close: i };
  }
  return undefined;
}

// "\text{שטח הריבוע } ADEF" becomes the text "שטח הריבוע " followed by the math "ADEF"
function wordsAndMath(group: string): RichSegment[] {
  const segments: RichSegment[] = [];
  let math = '';
  const flushMath = () => {
    if (math.trim()) segments.push({ kind: 'math', latex: math.trim() });
    math = '';
  };

  for (let i = 0; i < group.length; i++) {
    if (group.startsWith('\\text{', i)) {
      const text = readGroup(group, i + 5);
      if (!text) throw new Error(`unclosed \\text in "${group}"`);
      flushMath();
      segments.push({ kind: 'text', text: text.content });
      i = text.close;
    } else {
      math += group[i];
    }
  }
  flushMath();
  return segments;
}

function wordFraction(lead: string, latex: string): Paragraph | undefined {
  const trimmed = latex.trim();
  if (!trimmed.startsWith('\\frac{') || !trimmed.includes('\\text{')) return undefined;
  const numerator = readGroup(trimmed, 5);
  const denominator = numerator && readGroup(trimmed, numerator.close + 1);
  if (!numerator || !denominator) return undefined;
  return {
    kind: 'wordFraction',
    lead: lead.trim(),
    numerator: wordsAndMath(numerator.content),
    denominator: wordsAndMath(denominator.content),
    rest: trimmed.slice(denominator.close + 1).trim(),
  };
}

export function parseParagraphs(value: RichText): Paragraph[] {
  return value.split('\n').map((line): Paragraph => {
    const segments = parseRichText(line).filter((segment) => segment.kind === 'math' || segment.text.trim());
    const [first, second] = segments;
    if (segments.length === 1 && first.kind === 'math') {
      return wordFraction('', first.latex) ?? { kind: 'math', latex: first.latex.trim() };
    }
    if (segments.length === 2 && first.kind === 'text' && second.kind === 'math') {
      const labelled = wordFraction(first.text, second.latex);
      if (labelled) return labelled;
    }
    return { kind: 'text', segments: parseRichText(line) };
  });
}

// every latex string the app needs typeset to show this rich text
export function mathOf(value: RichText): string[] {
  return parseParagraphs(value).flatMap((paragraph) => {
    switch (paragraph.kind) {
      case 'math':
        return [paragraph.latex];
      case 'wordFraction':
        return [...paragraph.numerator, ...paragraph.denominator]
          .flatMap((segment) => (segment.kind === 'math' ? [segment.latex] : []))
          .concat(paragraph.rest ? [paragraph.rest] : []);
      case 'text':
        return paragraph.segments.flatMap((segment) => (segment.kind === 'math' ? [segment.latex.trim()] : []));
    }
  });
}
