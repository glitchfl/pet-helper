import { StyleSheet, Text } from 'react-native';
import type { PassageSet } from '@/bank/types';
import { useColors } from '@/ui/theme';

export function PassageText({ passage }: { passage: PassageSet }) {
  const colors = useColors();
  const markers = [...passage.lineMarkers].sort((a, b) => a.offset - b.offset);
  const pieces = [];
  let cursor = 0;
  for (const marker of markers) {
    pieces.push(passage.text.slice(cursor, marker.offset));
    pieces.push(
      <Text key={marker.line} style={[styles.marker, { color: colors.textSecondary }]}>
        {` ${marker.line} `}
      </Text>,
    );
    cursor = marker.offset;
  }
  pieces.push(passage.text.slice(cursor));

  return <Text style={[styles.text, { color: colors.text }]}>{pieces}</Text>;
}

const styles = StyleSheet.create({
  text: { fontSize: 18, lineHeight: 30 },
  marker: { fontSize: 12, fontWeight: '600' },
});
