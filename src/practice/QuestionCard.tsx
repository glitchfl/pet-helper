import { StyleSheet, Text, View } from 'react-native';
import type { OptionNumber, Question } from '@/bank/types';
import type { Feedback } from '@/engine/practice-engine';
import { RichText } from '@/ui/RichText';
import { useColors } from '@/ui/theme';
import { OptionButton } from './OptionButton';

type Props = {
  question: Question;
  chosen?: OptionNumber;
  feedback?: Feedback;
  onRespond: (option: OptionNumber) => void;
};

export function QuestionCard({ question, chosen, feedback, onRespond }: Props) {
  const colors = useColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.meta, { color: colors.muted }]}>
        שאלה {question.number} · {question.questionType}
      </Text>
      <RichText value={question.stem} style={[styles.stem, { color: colors.text }]} />
      <View style={styles.options}>
        {question.options.map((option, index) => (
          <OptionButton
            key={index}
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
  stem: { fontSize: 19, lineHeight: 29 },
  options: { gap: 10 },
});
