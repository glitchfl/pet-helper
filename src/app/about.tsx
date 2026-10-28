import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ATTRIBUTION_NOTICE, REPO_URL } from '@/nite';
import { useColors } from '@/ui/theme';

export default function AboutScreen() {
  const colors = useColors();

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <View style={[styles.notice, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.noticeText, { color: colors.text }]}>{ATTRIBUTION_NOTICE}</Text>
      </View>
      <Text style={[styles.body, { color: colors.text }]}>
        האפליקציה חינמית ופתוחה לכל, והקוד שלה פתוח לציבור. היא כוללת רק בחינות שמאל"ו אישר לשימוש ציבורי, ומציגה
        את התשובה הנכונה מתוך מפתח התשובות של כל בחינה, בלי הסברים.
      </Text>
      <Pressable onPress={() => Linking.openURL(REPO_URL)} accessibilityRole="link" hitSlop={8}>
        <Text style={[styles.link, { color: colors.accent }]}>הקוד באתר GitHub</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 18 },
  notice: { borderWidth: 1, borderRadius: 14, padding: 18 },
  noticeText: { fontSize: 17, lineHeight: 27 },
  body: { fontSize: 16, lineHeight: 25 },
  link: { fontSize: 16, fontWeight: '600' },
});
