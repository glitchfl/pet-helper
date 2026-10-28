import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Domain } from '@/bank/types';
import type { Progress } from '@/engine/practice-engine';
import { usePracticeEngine } from '@/practice/PracticeProvider';
import { Card } from '@/ui/Card';
import { Icon } from '@/ui/Icon';
import { ProgressBar } from '@/ui/ProgressBar';
import { ScrollScreen } from '@/ui/Screen';
import { DOMAIN_NAMES } from '@/ui/strings';
import { Text } from '@/ui/Text';
import { domainColors, useColors } from '@/ui/theme';

const DOMAINS: Domain[] = ['verbal', 'quantitative'];

export default function TodayScreen() {
  const engine = usePracticeEngine();
  const [progress, setProgress] = useState(() => DOMAINS.map((domain) => engine.progress(domain)));

  useFocusEffect(
    useCallback(() => {
      setProgress(DOMAINS.map((domain) => engine.progress(domain)));
    }, [engine]),
  );

  return (
    <ScrollScreen>
      <View style={styles.cards}>
        {DOMAINS.map((domain, index) => (
          <DomainCard key={domain} domain={domain} progress={progress[index]} />
        ))}
      </View>
    </ScrollScreen>
  );
}

function DomainCard({ domain, progress }: { domain: Domain; progress: Progress }) {
  const colors = useColors();
  const tint = domainColors(colors, domain);

  return (
    <Card
      onPress={() => router.push({ pathname: '/session', params: { domain } })}
      accessibilityLabel={`תרגול ${DOMAIN_NAMES[domain]}`}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.badge, { backgroundColor: tint.soft }]}>
          <Icon name={domain} size={18} color={tint.tint} />
        </View>
        <Text variant="title3" style={styles.flex}>
          {DOMAIN_NAMES[domain]}
        </Text>
        <Icon name="forward" size={14} color={colors.textTertiary} />
      </View>
      <ProgressBar progress={progress.total ? progress.seen / progress.total : 0} color={tint.tint} />
      <View style={styles.stats}>
        <Stat value={`${progress.seen}/${progress.total}`} label="נענו" />
        <Stat value={progress.percentCorrect === null ? '–' : `${progress.percentCorrect}%`} label="הצלחה" />
        <Stat value={String(progress.mistakes)} label="לתרגול חוזר" />
      </View>
    </Card>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="headline" tabular>
        {value}
      </Text>
      <Text variant="footnote" tone="secondary">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cards: { gap: 14 },
  card: { gap: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: { width: 36, height: 36, borderRadius: 11, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  stats: { flexDirection: 'row', gap: 28 },
  stat: { gap: 1 },
});
