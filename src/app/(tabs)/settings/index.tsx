import { router } from 'expo-router';
import { Linking } from 'react-native';
import { REPO_URL } from '@/nite';
import { ListRow, ListSection } from '@/ui/List';
import { ScrollScreen } from '@/ui/Screen';
import { useColors } from '@/ui/theme';

export default function SettingsScreen() {
  const colors = useColors();

  return (
    <ScrollScreen>
      <ListSection title="מידע">
        <ListRow title="על השאלות ומקורן" icon="info" iconColor={colors.accent} onPress={() => router.push('/settings/about')} />
        <ListRow title="קוד המקור" icon="code" iconColor="#5E5CE6" onPress={() => Linking.openURL(REPO_URL)} />
      </ListSection>
    </ScrollScreen>
  );
}
