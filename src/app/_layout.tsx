import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { PracticeProvider } from '@/practice/PracticeProvider';
import { useColors } from '@/ui/theme';

export default function RootLayout() {
  const scheme = useColorScheme();
  const colors = useColors();
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = {
    ...base,
    colors: { ...base.colors, background: colors.background, card: colors.background, text: colors.text, primary: colors.accent },
  };

  return (
    <ThemeProvider value={theme}>
      <PracticeProvider>
        <Stack screenOptions={{ headerShadowVisible: false, headerBackButtonDisplayMode: 'minimal' }}>
          <Stack.Screen name="index" options={{ title: 'PET Helper' }} />
          <Stack.Screen name="practice/[domain]" options={{ title: '' }} />
          <Stack.Screen name="formula-sheet" options={{ title: 'דף נוסחאות', presentation: 'modal' }} />
          <Stack.Screen name="about" options={{ title: 'על השאלות' }} />
        </Stack>
      </PracticeProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
