import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { parseRichText, type RichSegment } from '@/bank/rich-text';
import type { RichText as RichTextValue } from '@/bank/types';
import { mathHtml } from '@/math/math-html';

type Props = {
  value: RichTextValue;
  color: string;
  fontSize: number;
  lineHeight: number;
};

function segmentsOf(value: RichTextValue): RichSegment[] {
  try {
    return parseRichText(value);
  } catch {
    return [{ kind: 'text', text: value }];
  }
}

// plain text stays native - only text with math pays for a webview
export function RichText({ value, color, fontSize, lineHeight }: Props) {
  const segments = useMemo(() => segmentsOf(value), [value]);
  const html = useMemo(
    () => (segments.some((segment) => segment.kind === 'math') ? mathHtml(segments, { color, fontSize, lineHeight }) : null),
    [segments, color, fontSize, lineHeight],
  );
  const [height, setHeight] = useState(lineHeight);

  if (!html) {
    return (
      <Text style={{ color, fontSize, lineHeight }}>
        {segments.map((segment) => (segment.kind === 'text' ? segment.text : segment.latex)).join('')}
      </Text>
    );
  }

  return (
    <View style={[styles.frame, { height }]}>
      <WebView
        source={{ html }}
        originWhitelist={['*']}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onMessage={(event) => {
          const measured = Number(event.nativeEvent.data);
          if (measured > 0) setHeight(measured);
        }}
        style={styles.web}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { pointerEvents: 'none' },
  web: { backgroundColor: 'transparent' },
});
