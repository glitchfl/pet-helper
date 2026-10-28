import { Unmatched, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { questionBank } from '@/bank';
import { BankImage } from '@/ui/BankImage';
import { useColors } from '@/ui/theme';

export default function FormulaSheetScreen() {
  const { exam: examId } = useLocalSearchParams<{ exam: string }>();
  const colors = useColors();
  const exam = questionBank.find((candidate) => candidate.id === examId);
  if (!exam?.formulaSheet) return <Unmatched />;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      maximumZoomScale={3}
      minimumZoomScale={1}
    >
      <BankImage examId={exam.id} path={exam.formulaSheet} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 12 },
});
