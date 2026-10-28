import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Domain } from '@/bank/types';
import type { Progress } from '@/engine/practice-engine';
import { usePracticeEngine } from '@/practice/PracticeProvider';
import { DOMAIN_NAMES } from '@/ui/strings';
import { useColors } from '@/ui/theme';

const DOMAINS: Domain[] = ['verbal', 'quantitative'];

export default function HomeScreen() {
  const colors = useColors();
  const engine = usePracticeEngine();
  const [progress, setProgress] = useState(() => DOMAINS.map((domain) => engine.progress(domain)));

  useFocusEffect(
    useCallback(() => {
      setProgress(DOMAINS.map((domain) => engine.progress(domain)));
    }, [engine]),
  );

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>תרגול חופשי</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        בחרו תחום וקבלו שאלה אחר שאלה מתוך בחינות לדוגמה של מאל"ו.
      </Text>

      {DOMAINS.map((domain, index) => (
        <Link key={domain} href={{ pathname: '/practice/[domain]', params: { domain } }} asChild>
          <Pressable
            style={({ pressed }) => [
              styles.domain,
              { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={[styles.domainName, { color: colors.text }]}>{DOMAIN_NAMES[domain]}</Text>
            <ProgressRow progress={progress[index]} />
          </Pressable>
        </Link>
      ))}

      <Link href="/about" asChild>
        <Pressable accessibilityRole="link" hitSlop={8} style={styles.about}>
          <Text style={[styles.aboutLabel, { color: colors.accent }]}>על השאלות ומקורן</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

function ProgressRow({ progress }: { progress: Progress }) {
  const colors = useColors();
  const stats = [
    { label: 'נענו', value: `${progress.seen}/${progress.total}` },
    { label: 'הצלחה', value: progress.percentCorrect === null ? '–' : `${progress.percentCorrect}%` },
    { label: 'טעויות לתרגול', value: String(progress.mistakes) },
  ];

  return (
    <View style={styles.stats}>
      {stats.map((stat) => (
        <View key={stat.label} style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 14 },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 16, lineHeight: 24, marginBottom: 8 },
  domain: { borderWidth: 1, borderRadius: 14, padding: 20, gap: 6 },
  domainName: { fontSize: 22, fontWeight: '600' },
  stats: { flexDirection: 'row', gap: 24, marginTop: 6 },
  stat: { gap: 2 },
  statValue: { fontSize: 18, fontWeight: '600', fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 13 },
  about: { marginTop: 10, alignSelf: 'flex-start' },
  aboutLabel: { fontSize: 16, fontWeight: '600' },
});
