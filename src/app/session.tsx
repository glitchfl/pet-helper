import { Link, Stack, Unmatched, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Domain, OptionNumber } from '@/bank/types';
import type { CurrentQuestion, Feedback } from '@/engine/practice-engine';
import { CopyrightLine, Watermark } from '@/practice/NiteMarkings';
import { PassageText } from '@/practice/PassageText';
import { usePracticeEngine } from '@/practice/PracticeProvider';
import { QuestionCard } from '@/practice/QuestionCard';
import { reportUrl } from '@/practice/report';
import { SetTabs, type SetTab } from '@/practice/SetTabs';
import { BankImage } from '@/ui/BankImage';
import { RichText } from '@/ui/RichText';
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
  const [tab, setTab] = useState<SetTab>('question');
  const locked = useRef(false);

  const formulaSheetExam = domain === 'quantitative' && served?.exam.formulaSheet ? served.exam.id : undefined;
  const questionSet = served?.questionSet;
  const setPosition = questionSet
    ? `שאלה ${questionSet.questionIds.indexOf(served.question.id) + 1} מתוך ${questionSet.questionIds.length}`
    : '';

  function show(next: CurrentQuestion) {
    setServed(next);
    const opensPassage = next.questionSet?.kind === 'passage' && next.questionSet.questionIds[0] === next.question.id;
    setTab(opensPassage ? 'set' : 'question');
  }

  useEffect(() => {
    engine.start(domain);
    show(engine.current());
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
    show(engine.current());
    setChosen(undefined);
    setFeedback(undefined);
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: DOMAIN_NAMES[domain],
          headerRight: formulaSheetExam
            ? () => (
                <Link href={{ pathname: '/formula-sheet', params: { exam: formulaSheetExam } }} asChild>
                  <Pressable accessibilityRole="button" hitSlop={10}>
                    <Text style={[styles.headerButton, { color: colors.accent }]}>דף נוסחאות</Text>
                  </Pressable>
                </Link>
              )
            : undefined,
        }}
      />
      {questionSet?.kind === 'passage' && (
        <>
          <SetTabs tab={tab} setLabel="קטע הקריאה" questionLabel={setPosition} onChange={setTab} />
          <ScrollView key={questionSet.id} style={tab !== 'set' && styles.hidden} contentContainerStyle={styles.content}>
            <View style={[styles.setCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Watermark />
              <PassageText passage={questionSet} />
              <CopyrightLine />
            </View>
          </ScrollView>
        </>
      )}
      {served && (
        <ScrollView
          key={served.question.id}
          style={tab !== 'question' && styles.hidden}
          contentContainerStyle={styles.content}
        >
          {questionSet?.kind === 'chart' && (
            <View style={styles.chart}>
              {questionSet.intro && <RichText value={questionSet.intro} color={colors.text} fontSize={15} lineHeight={23} />}
              <BankImage examId={served.exam.id} path={questionSet.image} />
              <Text style={[styles.setPosition, { color: colors.textSecondary }]}>{setPosition} על התרשים</Text>
            </View>
          )}
          <QuestionCard
            examId={served.exam.id}
            sample={served.exam.sample}
            question={served.question}
            chosen={chosen}
            feedback={feedback}
            onRespond={respond}
            onReport={() => Linking.openURL(reportUrl(served))}
          />
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
        ) : tab === 'set' ? (
          <Pressable
            onPress={() => setTab('question')}
            accessibilityRole="button"
            style={({ pressed }) => [styles.next, { backgroundColor: colors.accent, opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={[styles.nextLabel, { color: colors.onAccent }]}>לשאלה</Text>
          </Pressable>
        ) : (
          <View style={styles.row}>
            <Text style={[styles.hint, { color: colors.textSecondary }]}>בחרו תשובה</Text>
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
  headerButton: { fontSize: 16, fontWeight: '600' },
  content: { padding: 16, paddingBottom: 32 },
  hidden: { display: 'none' },
  setCard: { borderWidth: 1, borderRadius: 16, padding: 18, gap: 12, overflow: 'hidden' },
  chart: { gap: 8, marginBottom: 14 },
  setPosition: { fontSize: 14 },
  bar: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  verdict: { fontSize: 17, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hint: { fontSize: 15, paddingVertical: 14 },
  skip: { borderWidth: 1, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 22 },
  skipLabel: { fontSize: 16, fontWeight: '600' },
  next: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  nextLabel: { fontSize: 18, fontWeight: '700' },
});
