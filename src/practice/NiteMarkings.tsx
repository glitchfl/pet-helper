import { StyleSheet, Text, View } from 'react-native';
import { COPYRIGHT_LINE, WATERMARK_TEXT } from '@/nite';
import { useColors } from '@/ui/theme';

const ROWS = 14;

// nite's public-use license forbids dropping its markings - keep both on every card that shows its content
export function Watermark() {
  const colors = useColors();
  return (
    <View style={styles.layer} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={styles.rotated}>
        {Array.from({ length: ROWS }, (_, row) => (
          <Text key={row} numberOfLines={1} style={[styles.mark, { color: colors.watermark }]}>
            {`${WATERMARK_TEXT}   ${WATERMARK_TEXT}   ${WATERMARK_TEXT}`}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function CopyrightLine() {
  const colors = useColors();
  return <Text style={[styles.copyright, { color: colors.textSecondary }]}>{COPYRIGHT_LINE}</Text>;
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, overflow: 'hidden', pointerEvents: 'none' },
  rotated: {
    position: 'absolute',
    top: -200,
    bottom: -200,
    left: -200,
    right: -200,
    justifyContent: 'space-around',
    transform: [{ rotate: '-30deg' }],
  },
  mark: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  copyright: { fontSize: 12, textAlign: 'center', marginTop: 4 },
});
