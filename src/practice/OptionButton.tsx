import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Option, OptionNumber } from '@/bank/types';
import type { Feedback } from '@/engine/practice-engine';
import { BankImage } from '@/ui/BankImage';
import { RichText } from '@/ui/RichText';
import { useColors } from '@/ui/theme';

type Props = {
  examId: string;
  number: OptionNumber;
  option: Option;
  chosen?: OptionNumber;
  feedback?: Feedback;
  onPress: (number: OptionNumber) => void;
};

export function OptionButton({ examId, number, option, chosen, feedback, onPress }: Props) {
  const colors = useColors();
  const isCorrect = feedback?.correctOption === number;
  const isWrongChoice = feedback !== undefined && chosen === number && !isCorrect;
  const isSelected = feedback === undefined && chosen === number;

  const tone = isCorrect
    ? { backgroundColor: colors.correctSoft, borderColor: colors.correct }
    : isWrongChoice
      ? { backgroundColor: colors.wrongSoft, borderColor: colors.wrong }
      : isSelected
        ? { backgroundColor: colors.accentSoft, borderColor: colors.accent }
        : { backgroundColor: 'transparent', borderColor: colors.border };
  const markColor = isCorrect
    ? colors.correct
    : isWrongChoice
      ? colors.wrong
      : isSelected
        ? colors.accent
        : colors.textSecondary;

  return (
    <Pressable
      disabled={feedback !== undefined}
      onPress={() => onPress(number)}
      accessibilityRole="button"
      accessibilityState={{ disabled: feedback !== undefined, selected: chosen === number }}
      style={({ pressed }) => [
        styles.option,
        tone,
        { opacity: feedback && !isCorrect && !isWrongChoice ? 0.55 : pressed ? 0.7 : 1 },
      ]}
    >
      <Text style={[styles.number, { color: markColor }]}>
        {isCorrect ? '✓' : isWrongChoice ? '✗' : `(${number})`}
      </Text>
      <View style={styles.body}>
        {'text' in option ? (
          <RichText value={option.text} color={colors.text} fontSize={18} lineHeight={26} />
        ) : (
          <BankImage examId={examId} path={option.image} maxHeight={150} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  number: { fontSize: 16, fontWeight: '600', minWidth: 28, textAlign: 'center' },
  body: { flex: 1 },
});
