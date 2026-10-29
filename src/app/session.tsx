import { Link, Stack, Unmatched, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Domain, OptionNumber } from '@/bank/types';
import type {
  CurrentQuestion,
  Feedback,
  Focus,
  Mode,
  Recap,
  RecapItem,
  RoundProgress,
} from '@/engine/practice-engine';
import { CopyrightLine, Watermark } from '@/practice/NiteMarkings';
import { PassageText } from '@/practice/PassageText';
import { usePracticeEngine } from '@/practice/PracticeProvider';
import { QuestionCard } from '@/practice/QuestionCard';
import { RecapView } from '@/practice/RecapView';
import { reportUrl } from '@/practice/report';
import { SetTabs, type SetTab } from '@/practice/SetTabs';
import { BankImage } from '@/ui/BankImage';
import { Button } from '@/ui/Button';
import { EmptyState } from '@/ui/EmptyState';
import { haptics } from '@/ui/haptics';
import { Icon } from '@/ui/Icon';
import { ProgressBar } from '@/ui/ProgressBar';
import { RichText } from '@/ui/RichText';
import { DOMAIN_NAMES, clockTime, focusName, isDomain } from '@/ui/strings';
import { useColors } from '@/ui/theme';

export default function PracticeRoute() {
  const { domain, focus, mode } = useLocalSearchParams<{ domain: string; focus?: string; mode?: string }>();
  const parsedMode = useMemo(() => modeOf(mode, focus), [mode, focus]);
  if (!isDomain(domain) || parsedMode === null) return <Unmatched />;
  return <PracticeScreen domain={domain} mode={parsedMode} />;
}

function modeOf(mode: string | undefined, focus: string | undefined): Mode | null {
  if (mode === 'mistakes') return { kind: 'mistakes' };
  if (mode !== undefined) return null;
  if (focus === undefined) return { kind: 'free' };
  const parsed = parseFocus(focus);
  return parsed && { kind: 'drill', focus: parsed };
}

function parseFocus(param: string): Focus[] | null {
  try {
    const focus: unknown = JSON.parse(param);
    const valid =
      Array.isArray(focus) &&
      focus.length > 0 &&
      focus.every((item) => typeof item?.questionType === 'string' && ['string', 'undefined'].includes(typeof item.topic));
    return valid ? focus : null;
  } catch {
    return null;
  }
}

function titleOf(domain: Domain, mode: Mode) {
  if (mode.kind === 'mistakes') return `טעויות · ${DOMAIN_NAMES[domain]}`;
  if (mode.kind === 'drill' && mode.focus.length === 1) return focusName(mode.focus[0]);
  return DOMAIN_NAMES[domain];
}

function PracticeScreen({ domain, mode }: { domain: Domain; mode: Mode }) {
  const engine = usePracticeEngine();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [served, setServed] = useState<CurrentQuestion>();
  const [chosen, setChosen] = useState<OptionNumber>();
  const [feedback, setFeedback] = useState<Feedback>();
  const [tab, setTab] = useState<SetTab>('question');
  const [round, setRound] = useState<RoundProgress>({ done: 0, total: 0 });
  const [recap, setRecap] = useState<Recap>();
  const [reviewing, setReviewing] = useState<RecapItem>();
  const [empty, setEmpty] = useState(false);
  const locked = useRef(false);

  const more = useMemo(
    () => recap !== undefined && (mode.kind !== 'mistakes' || engine.progress(domain).mistakes > 0),
    [recap, mode, engine, domain],
  );

  // a wrong answer opened from the Recap shows the same way it did right after Check
  const viewed = reviewing ?? (recap ? undefined : served);
  const viewedChosen = reviewing ? reviewing.option : chosen;
  const viewedFeedback: Feedback | undefined = reviewing
    ? { correct: false, correctOption: reviewing.question.correctOption, durationMs: reviewing.durationMs ?? 0 }
    : feedback;

  const formulaSheetExam = domain === 'quantitative' && viewed?.exam.formulaSheet ? viewed.exam.id : undefined;
  const questionSet = viewed?.questionSet;
  const setPosition = questionSet
    ? `שאלה ${questionSet.questionIds.indexOf(viewed.question.id) + 1} מתוך ${questionSet.questionIds.length}`
    : '';

  function show(next: CurrentQuestion) {
    setServed(next);
    setChosen(undefined);
    setFeedback(undefined);
    setRound(engine.round());
    const opensPassage = next.questionSet?.kind === 'passage' && next.questionSet.questionIds[0] === next.question.id;
    setTab(opensPassage ? 'set' : 'question');
  }

  useEffect(() => {
    if (engine.start(domain, mode)) show(engine.current());
    else setEmpty(true);
  }, [engine, domain, mode]);

  function select(option: OptionNumber) {
    if (locked.current) return;
    haptics.selection();
    setChosen(option);
  }

  async function check() {
    if (chosen === undefined || locked.current) return;
    locked.current = true;
    try {
      const result = await engine.respond(chosen);
      if (result.correct) haptics.success();
      else haptics.error();
      setFeedback(result);
      setRound(engine.round());
    } catch (error) {
      locked.current = false;
      throw error;
    }
  }

  function move(action: () => void) {
    action();
    locked.current = false;
    const ended = engine.recap();
    if (ended) setRecap(ended);
    else show(engine.current());
  }

  function nextRound() {
    if (!engine.nextRound()) return router.back();
    setRecap(undefined);
    show(engine.current());
  }

  function review(item: RecapItem) {
    setReviewing(item);
    setTab('question');
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: titleOf(domain, mode),
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
      {empty && (
        <EmptyState
          icon="checkCircle"
          tint={colors.correct}
          title="אין טעויות לתרגל"
          message="שאלה שתטעו בה תחכה לכם כאן עד שתענו עליה נכון."
        >
          <Button label="חזרה" variant="secondary" compact onPress={() => router.back()} />
        </EmptyState>
      )}
      {recap && !reviewing && (
        <RecapView recap={recap} more={more} onReview={review} onNextRound={nextRound} onFinish={() => router.back()} />
      )}
      {viewed && (
        <>
          {!reviewing && (
            <View style={styles.roundBar}>
              <ProgressBar progress={round.total ? round.done / round.total : 0} height={4} />
            </View>
          )}
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
          <ScrollView
            key={viewed.question.id}
            style={tab !== 'question' && styles.hidden}
            contentContainerStyle={styles.content}
          >
            {questionSet?.kind === 'chart' && (
              <View style={styles.chart}>
                {questionSet.intro && <RichText value={questionSet.intro} color={colors.text} fontSize={15} lineHeight={23} />}
                <BankImage examId={viewed.exam.id} path={questionSet.image} />
                <Text style={[styles.setPosition, { color: colors.textSecondary }]}>{setPosition} על התרשים</Text>
              </View>
            )}
            <QuestionCard
              examId={viewed.exam.id}
              sample={viewed.exam.sample}
              question={viewed.question}
              chosen={viewedChosen}
              feedback={viewedFeedback}
              onSelect={select}
              onReport={() => Linking.openURL(reportUrl(viewed))}
            />
          </ScrollView>

          <View style={[styles.bar, { paddingBottom: insets.bottom + 12, borderColor: colors.border }]}>
            {reviewing ? (
              <Button label="חזרה לסיכום" onPress={() => setReviewing(undefined)} />
            ) : feedback ? (
              <>
                <View style={styles.row}>
                  <Text style={[styles.verdict, { color: feedback.correct ? colors.correct : colors.wrong }]}>
                    {feedback.correct ? 'נכון!' : `לא נכון. התשובה הנכונה היא (${feedback.correctOption})`}
                  </Text>
                  <View style={styles.time} accessibilityLabel={`זמן: ${clockTime(feedback.durationMs)}`}>
                    <Icon name="stopwatch" size={14} color={colors.textSecondary} />
                    <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>{clockTime(feedback.durationMs)}</Text>
                  </View>
                </View>
                <Button label={round.done === round.total ? 'לסיכום הסבב' : 'הבא'} onPress={() => move(engine.next)} />
              </>
            ) : tab === 'set' ? (
              <Button label="לשאלה" onPress={() => setTab('question')} />
            ) : (
              <View style={styles.row}>
                <Button label="בדיקה" disabled={chosen === undefined} onPress={check} style={styles.check} />
                <Button label="דלג" variant="secondary" onPress={() => move(engine.skip)} />
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerButton: { fontSize: 16, fontWeight: '600' },
  roundBar: { paddingHorizontal: 16, paddingTop: 8 },
  content: { padding: 16, paddingBottom: 32 },
  hidden: { display: 'none' },
  setCard: { borderWidth: 1, borderRadius: 16, padding: 18, gap: 12, overflow: 'hidden' },
  chart: { gap: 8, marginBottom: 14 },
  setPosition: { fontSize: 14 },
  bar: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  verdict: { flex: 1, fontSize: 17, fontWeight: '600' },
  time: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeLabel: { fontSize: 15, fontVariant: ['tabular-nums'] },
  check: { flex: 1 },
});
