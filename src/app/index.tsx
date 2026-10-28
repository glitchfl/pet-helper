import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import type { Domain } from '@/bank/types';
import { DOMAIN_NAMES } from '@/ui/strings';
import { useColors } from '@/ui/theme';

const DOMAINS: Domain[] = ['verbal', 'quantitative'];

export default function HomeScreen() {
  const colors = useColors();

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>תרגול חופשי</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        בחרו תחום וקבלו שאלה אחר שאלה מתוך בחינות לדוגמה של מאל"ו.
      </Text>

      {DOMAINS.map((domain) => (
        <Link key={domain} href={{ pathname: '/practice/[domain]', params: { domain } }} asChild>
          <Pressable
            style={({ pressed }) => [
              styles.domain,
              { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={[styles.domainName, { color: colors.text }]}>{DOMAIN_NAMES[domain]}</Text>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 14 },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 16, lineHeight: 24, marginBottom: 8 },
  domain: { borderWidth: 1, borderRadius: 14, padding: 20, gap: 6 },
  domainName: { fontSize: 22, fontWeight: '600' },
});
