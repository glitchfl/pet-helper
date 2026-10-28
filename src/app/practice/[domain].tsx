import { Stack, Unmatched, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Domain, OptionNumber } from '@/bank/types';
import type { CurrentQuestion, Feedback } from '@/engine/practice-engine';
import { usePracticeEngine } from '@/practice/PracticeProvider';
import { QuestionCard } from '@/practice/QuestionCard';
import { DOMAIN_NAMES, isDomain } from '@/ui/strings';
import { useColors } from '@/ui/theme';

export default function PracticeRoute() {
  const { domain } = useLocalSearchParams<{ domain: string }>();
  return isDomain(domain) ? <PracticeScreen domain={domain} /> : <Unmatched />;
}

function PracticeScreen({ domain }: { domain: Domain }) {
  const engine = usePracticeEngine();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [served, setServed] = useState<CurrentQuestion>();
  const [chosen, setChosen] = useState<OptionNumber>();
  const [feedback, setFeedback] = useState<Feedback>();
  const locked = useRef(false);

  useEffect(() => {
    engine.start(domain);
    setServed(engine.current());
  }, [engine, domain]);

  async function respond(option: OptionNumber) {
    if (locked.current) return;
    locked.current = true;
    setChosen(option);
    try {
      setFeedback(await engine.respond(option));
    } catch (error) {
      locked.current = false;
      setChosen(undefined);
      throw error;
    }
  }

  function move(action: () => void) {
    action();
    locked.current = false;
    setServed(engine.current());
    setChosen(undefined);
    setFeedback(undefined);
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: DOMAIN_NAMES[domain] }} />
      {served && (
        <ScrollView key={served.question.id} contentContainerStyle={styles.content}>
          <QuestionCard question={served.question} chosen={chosen} feedback={feedback} onRespond={respond} />
        </ScrollView>
      )}

      <View style={[styles.bar, { paddingBottom: insets.bottom + 12, borderColor: colors.border }]}>
        {feedback ? (
          <>
            <Text style={[styles.verdict, { color: feedback.correct ? colors.correct : colors.wrong }]}>
              {feedback.correct ? 'נכון!' : `לא נכון. התשובה הנכונה היא (${feedback.correctOption})`}
            </Text>
            <Pressable
              onPress={() => move(engine.next)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.next, { backgroundColor: colors.accent, opacity: pressed ? 0.8 : 1 }]}
            >
              <Text style={[styles.nextLabel, { color: colors.onAccent }]}>הבא</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.row}>
            <Text style={[styles.hint, { color: colors.muted }]}>בחרו תשובה</Text>
            <Pressable
              onPress={() => move(engine.skip)}
              accessibilityRole="button"
              hitSlop={8}
              style={({ pressed }) => [styles.skip, { borderColor: colors.border, opacity: pressed ? 0.6 : 1 }]}
            >
              <Text style={[styles.skipLabel, { color: colors.text }]}>דלג</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  bar: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  verdict: { fontSize: 17, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hint: { fontSize: 15, paddingVertical: 14 },
  skip: { borderWidth: 1, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 22 },
  skipLabel: { fontSize: 16, fontWeight: '600' },
  next: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  nextLabel: { fontSize: 18, fontWeight: '700' },
});
