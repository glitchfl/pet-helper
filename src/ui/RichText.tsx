import { memo, useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { parseParagraphs, type Paragraph, type RichSegment } from '@/bank/rich-text';
import type { RichText as RichTextValue } from '@/bank/types';
import { mathBox, type MathBox } from '@/math/math';

type Props = {
  value: RichTextValue;
  color: string;
  fontSize: number;
  lineHeight: number;
  // the width a display formula may take before it is scaled down to fit
  maxWidth?: number;
};

const MAX_FONT_SCALE = 1.6;
// mathjax's computer modern runs small next to the system hebrew font
const MATH_SCALE = 1.08;

type Metrics = { fontSize: number; lineHeight: number; em: number; color: string; maxWidth: number };

function safeParagraphs(value: RichTextValue): Paragraph[] {
  try {
    return parseParagraphs(value);
  } catch {
    return [{ kind: 'text', segments: [{ kind: 'text', text: value }] }];
  }
}

// no webviews: math is typeset at build time and drawn as native svg inside native text,
// so a question appears in one frame and bidi and line breaking stay native
export const RichText = memo(function RichText({ value, color, fontSize, lineHeight, maxWidth }: Props) {
  const { width, fontScale } = useWindowDimensions();
  const paragraphs = useMemo(() => safeParagraphs(value), [value]);
  const scale = Math.min(fontScale, MAX_FONT_SCALE);
  const metrics: Metrics = {
    fontSize,
    lineHeight,
    em: fontSize * scale * MATH_SCALE,
    color,
    maxWidth: maxWidth ?? width - 72,
  };

  return (
    <View>
      {paragraphs.map((paragraph, index) => (
        <ParagraphView key={index} paragraph={paragraph} metrics={metrics} />
      ))}
    </View>
  );
});

function ParagraphView({ paragraph, metrics }: { paragraph: Paragraph; metrics: Metrics }) {
  switch (paragraph.kind) {
    case 'math':
      return (
        <View style={styles.display}>
          <DisplayMath latex={paragraph.latex} metrics={metrics} />
        </View>
      );
    case 'wordFraction':
      return <WordFraction paragraph={paragraph} metrics={metrics} />;
    case 'text':
      return <Line segments={paragraph.segments} metrics={metrics} />;
  }
}

// a line of text with formulas sitting on its baseline. lines grow to fit tall formulas,
// since a fixed line height would let them overlap the neighbouring lines
function Line({ segments, metrics, center }: { segments: RichSegment[]; metrics: Metrics; center?: boolean }) {
  const { fontSize, em, color } = metrics;
  const halfText = fontSize * 0.3;
  let lineHeight = metrics.lineHeight;
  for (const segment of segments) {
    const box = segment.kind === 'math' ? mathBox(segment.latex.trim()) : undefined;
    if (box) {
      lineHeight = Math.max(lineHeight, 2 * (box.ascent * em - halfText) + 4, 2 * (box.descent * em + halfText) + 4);
    }
  }

  return (
    <Text
      maxFontSizeMultiplier={MAX_FONT_SCALE}
      style={[{ color, fontSize, lineHeight }, center && styles.center]}
    >
      {segments.map((segment, index) =>
        segment.kind === 'text' ? segment.text : <InlineMath key={index} latex={segment.latex.trim()} metrics={metrics} />,
      )}
    </Text>
  );
}

// an inline view sits with its bottom on the baseline, so it is lowered by the formula's descent
function InlineMath({ latex, metrics }: { latex: string; metrics: Metrics }) {
  const box = mathBox(latex);
  if (!box) return <Text>{latex}</Text>;
  const { em, color } = metrics;
  return (
    <View style={{ width: box.width * em, height: (box.ascent + box.descent) * em, transform: [{ translateY: box.descent * em }] }}>
      <MathSvg box={box} em={em} color={color} />
    </View>
  );
}

function DisplayMath({ latex, metrics }: { latex: string; metrics: Metrics }) {
  const box = mathBox(latex);
  if (!box) return <Text style={{ color: metrics.color, fontSize: metrics.fontSize }}>{latex}</Text>;
  const em = Math.min(metrics.em, metrics.maxWidth / box.width);
  return <MathSvg box={box} em={em} color={metrics.color} accessibilityLabel={latex} />;
}

function MathSvg({ box, em, color, accessibilityLabel }: { box: MathBox; em: number; color: string; accessibilityLabel?: string }) {
  return (
    <SvgXml
      xml={box.svg}
      width={box.width * em}
      height={(box.ascent + box.descent) * em}
      color={color}
      accessibilityLabel={accessibilityLabel}
    />
  );
}

// math reads left to right even inside hebrew, so the fraction and what follows it sit in an ltr row,
// while the hebrew phrases above and below the bar wrap right to left
function WordFraction({ paragraph, metrics }: { paragraph: Extract<Paragraph, { kind: 'wordFraction' }>; metrics: Metrics }) {
  const { color, fontSize, lineHeight } = metrics;
  return (
    <View style={styles.wordFraction}>
      {paragraph.lead !== '' && (
        <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={{ color, fontSize, lineHeight }}>
          {paragraph.lead}
        </Text>
      )}
      <View style={styles.ltrRow}>
        <View style={styles.fraction}>
          <Line segments={paragraph.numerator} metrics={metrics} center />
          <View style={[styles.bar, { backgroundColor: color }]} />
          <Line segments={paragraph.denominator} metrics={metrics} center />
        </View>
        {paragraph.rest !== '' && <DisplayMath latex={paragraph.rest} metrics={metrics} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  display: { alignItems: 'flex-start', paddingVertical: 4 },
  center: { textAlign: 'center' },
  wordFraction: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  ltrRow: { direction: 'ltr', flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  fraction: { direction: 'rtl', flexShrink: 1, alignItems: 'stretch', gap: 4 },
  bar: { height: 1.5, borderRadius: 1 },
});
