import { Stack, Unmatched, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Domain } from '@/bank/types';
import type { Focus, Progress } from '@/engine/practice-engine';
import { usePracticeEngine } from '@/practice/PracticeProvider';
import { Button } from '@/ui/Button';
import { ListRow, ListSection } from '@/ui/List';
import { DOMAIN_NAMES, focusName, isDomain } from '@/ui/strings';
import { Text } from '@/ui/Text';
import { useColors } from '@/ui/theme';

export default function DrillRoute() {
  const { domain } = useLocalSearchParams<{ domain: string }>();
  return isDomain(domain) ? <DrillScreen domain={domain} /> : <Unmatched />;
}

type Group = { title?: string; focuses: Focus[] };

// a Question Type split into Topics gets its own titled section, the whole Question Types share one
function groupsOf(focuses: Focus[]): Group[] {
  const groups: Group[] = [];
  for (const focus of focuses) {
    const title = focus.topic === undefined ? undefined : focus.questionType;
    const last = groups[groups.length - 1];
    if (last && last.title === title) last.focuses.push(focus);
    else groups.push({ title, focuses: [focus] });
  }
  return groups;
}

function progressLine({ seen, total, percentCorrect }: Progress) {
  const answered = `${seen}/${total} נענו`;
  return percentCorrect === null ? answered : `${answered} · ${percentCorrect}% הצלחה`;
}

function questionCount(count: number) {
  return count === 1 ? 'שאלה אחת' : `${count} שאלות`;
}

function DrillScreen({ domain }: { domain: Domain }) {
  const engine = usePracticeEngine();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const focuses = useMemo(() => engine.focuses(domain), [engine, domain]);
  const groups = useMemo(() => groupsOf(focuses), [focuses]);
  const [picked, setPicked] = useState<ReadonlySet<Focus>>(new Set());
  const [progress, setProgress] = useState(() => new Map(focuses.map((focus) => [focus, engine.progress(domain, [focus])])));

  useFocusEffect(
    useCallback(() => {
      setProgress(new Map(focuses.map((focus) => [focus, engine.progress(domain, [focus])])));
    }, [engine, domain, focuses]),
  );

  const chosen = focuses.filter((focus) => picked.has(focus));
  const allPicked = chosen.length === focuses.length;

  function toggle(focus: Focus) {
    setPicked((current) => {
      const next = new Set(current);
      if (!next.delete(focus)) next.add(focus);
      return next;
    });
  }

  function start() {
    router.push({ pathname: '/session', params: { domain, focus: JSON.stringify(chosen) } });
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: DOMAIN_NAMES[domain],
          headerRight: () => (
            <Pressable
              onPress={() => setPicked(allPicked ? new Set() : new Set(focuses))}
              accessibilityRole="button"
              hitSlop={10}
            >
              <Text variant="callout" weight="600" color={colors.accent}>
                {allPicked ? 'נקו הכל' : 'בחרו הכל'}
              </Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {groups.map((group) => (
          <ListSection key={group.title ?? ''} title={group.title}>
            {group.focuses.map((focus) => (
              <ListRow
                key={focusName(focus)}
                title={focusName(focus)}
                subtitle={progressLine(progress.get(focus)!)}
                checked={picked.has(focus)}
                onPress={() => toggle(focus)}
              />
            ))}
          </ListSection>
        ))}
      </ScrollView>
      <View style={[styles.bar, { paddingBottom: insets.bottom + 12, borderColor: colors.border }]}>
        <Button
          label={chosen.length > 0 ? `התחילו · ${questionCount(engine.progress(domain, chosen).total)}` : 'בחרו מה לתרגל'}
          disabled={chosen.length === 0}
          onPress={start}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 24 },
  bar: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingTop: 12 },
});
