import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Recap, RecapItem } from '@/engine/practice-engine';
import { SECTION_MS } from '@/nite';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { ListRow, ListSection } from '@/ui/List';
import { clockTime, examName } from '@/ui/strings';
import { Text } from '@/ui/Text';
import { useColors } from '@/ui/theme';

type Props = {
  recap: Recap;
  // false once a Mistakes Review has no Mistakes left
  more: boolean;
  onReview: (item: RecapItem) => void;
  onNextRound: () => void;
  onFinish: () => void;
};

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function RecapView({ recap, more, onReview, onNextRound, onFinish }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { counts, missed, time } = useMemo(() => {
    const answered = recap.items.filter((item) => item.outcome !== 'skipped');
    const count = (outcome: RecapItem['outcome']) => recap.items.filter((item) => item.outcome === outcome).length;
    return {
      counts: { correct: count('correct'), wrong: count('wrong'), skipped: count('skipped') },
      missed: recap.items.filter((item) => item.outcome === 'wrong'),
      time:
        answered.length === 0
          ? undefined
          : {
              perQuestion: average(answered.map((item) => item.durationMs ?? 0)),
              pace: average(answered.map((item) => SECTION_MS / item.section.questions.length)),
            },
    };
  }, [recap]);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="title2">{more ? 'סוף הסבב' : 'תיקנתם את כל הטעויות'}</Text>
        <Card style={styles.stats}>
          <Stat value={String(counts.correct)} label="נכון" color={colors.correct} />
          <Stat value={String(counts.wrong)} label="לא נכון" color={colors.wrong} />
          <Stat value={String(counts.skipped)} label="דילגתם" />
        </Card>
        <Card style={styles.stats}>
          <Stat value={clockTime(recap.durationMs)} label="זמן הסבב" />
          {time && <Stat value={clockTime(time.perQuestion)} label="ממוצע לשאלה" />}
          {time && <Stat value={clockTime(time.pace)} label="קצב בבחינה" />}
        </Card>
        {missed.length > 0 && (
          <ListSection title="שאלות שטעיתם בהן">
            {missed.map((item) => (
              <ListRow
                key={item.question.id}
                title={`שאלה ${item.question.number} · ${item.question.topic ?? item.question.questionType}`}
                subtitle={`${examName(item.exam)} · פרק ${item.section.number}`}
                onPress={() => onReview(item)}
              />
            ))}
          </ListSection>
        )}
      </ScrollView>
      <View style={[styles.bar, { paddingBottom: insets.bottom + 12, borderColor: colors.border }]}>
        {more && <Button label="סבב נוסף" onPress={onNextRound} />}
        <Button label="סיום" variant={more ? 'secondary' : 'primary'} onPress={onFinish} />
      </View>
    </View>
  );
}

function Stat({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="title2" color={color} tabular>
        {value}
      </Text>
      <Text variant="footnote" tone="secondary">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 16 },
  stats: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center', gap: 2 },
  bar: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingTop: 12, gap: 10 },
});
