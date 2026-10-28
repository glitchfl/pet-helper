import { Stack } from 'expo-router';
import { Linking, StyleSheet } from 'react-native';
import { ATTRIBUTION_NOTICE, REPO_URL } from '@/nite';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { ScrollScreen } from '@/ui/Screen';
import { Text } from '@/ui/Text';

export default function AboutScreen() {
  return (
    <ScrollScreen contentStyle={styles.content}>
      <Stack.Screen options={{ title: 'על השאלות', headerLargeTitleEnabled: false }} />
      <Card>
        <Text variant="body" style={styles.notice}>
          {ATTRIBUTION_NOTICE}
        </Text>
      </Card>
      <Text variant="callout" tone="secondary" style={styles.body}>
        האפליקציה חינמית ופתוחה לכל, והקוד שלה פתוח לציבור. היא כוללת רק בחינות שמאל"ו אישר לשימוש ציבורי, ומציגה את
        התשובה הנכונה מתוך מפתח התשובות של כל בחינה, בלי הסברים.
      </Text>
      <Button label="הקוד באתר GitHub" icon="code" variant="secondary" onPress={() => Linking.openURL(REPO_URL)} />
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 18 },
  notice: { lineHeight: 28 },
  body: { paddingHorizontal: 4, lineHeight: 24 },
});
