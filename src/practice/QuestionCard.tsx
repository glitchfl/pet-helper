import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { OptionNumber, Question } from '@/bank/types';
import type { Feedback } from '@/engine/practice-engine';
import { BankImage } from '@/ui/BankImage';
import { RichText } from '@/ui/RichText';
import { useColors } from '@/ui/theme';
import { CopyrightLine, Watermark } from './NiteMarkings';
import { OptionButton } from './OptionButton';

type Props = {
  examId: string;
  sample?: boolean;
  question: Question;
  chosen?: OptionNumber;
  feedback?: Feedback;
  onRespond: (option: OptionNumber) => void;
  onReport: () => void;
};

export function QuestionCard({ examId, sample, question, chosen, feedback, onRespond, onReport }: Props) {
  const colors = useColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Watermark />
      <View style={styles.header}>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          שאלה {question.number} · {question.questionType}
          {sample && ' · שאלת דוגמה'}
        </Text>
        <Pressable onPress={onReport} accessibilityRole="link" hitSlop={10}>
          <Text style={[styles.report, { color: colors.accent }]}>דיווח על טעות</Text>
        </Pressable>
      </View>
      <RichText value={question.stem} color={colors.text} fontSize={19} lineHeight={29} />
      {question.figure && <BankImage examId={examId} path={question.figure} maxHeight={320} />}
      <View style={styles.options}>
        {question.options.map((option, index) => (
          <OptionButton
            key={index}
            examId={examId}
            number={(index + 1) as OptionNumber}
            option={option}
            chosen={chosen}
            feedback={feedback}
            onPress={onRespond}
          />
        ))}
      </View>
      <CopyrightLine />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 18, gap: 14, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  meta: { fontSize: 14, flexShrink: 1 },
  report: { fontSize: 14, fontWeight: '600' },
  options: { gap: 10 },
});
