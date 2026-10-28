import { StyleSheet, Text, View } from 'react-native';
import type { OptionNumber, Question } from '@/bank/types';
import type { Feedback } from '@/engine/practice-engine';
import { BankImage } from '@/ui/BankImage';
import { RichText } from '@/ui/RichText';
import { useColors } from '@/ui/theme';
import { OptionButton } from './OptionButton';

type Props = {
  examId: string;
  question: Question;
  chosen?: OptionNumber;
  feedback?: Feedback;
  onRespond: (option: OptionNumber) => void;
};

export function QuestionCard({ examId, question, chosen, feedback, onRespond }: Props) {
  const colors = useColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.meta, { color: colors.muted }]}>
        שאלה {question.number} · {question.questionType}
      </Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 18, gap: 14, overflow: 'hidden' },
  meta: { fontSize: 14 },
  options: { gap: 10 },
});
