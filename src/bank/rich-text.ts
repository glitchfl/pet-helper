import type { RichText } from './types';

export type RichSegment = { kind: 'text'; text: string } | { kind: 'math'; latex: string };

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
