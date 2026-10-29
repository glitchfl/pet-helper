import { DarkTheme, DefaultTheme, LocaleProvider, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PracticeProvider } from '@/practice/PracticeProvider';
import { useColors } from '@/ui/theme';

export default function RootLayout() {
  const scheme = useColorScheme();
  const colors = useColors();
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = {
    ...base,
    colors: {
      ...base.colors,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      primary: colors.accent,
      border: colors.separator,
    },
  };

  // rtl is forced here instead of trusting I18nManager (ADR 0004):
  // the root view's direction flows down the whole layout tree, and LocaleProvider flips the native stacks
  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: colors.background }]}>
      <ThemeProvider value={theme}>
        <LocaleProvider direction="rtl">
          <PracticeProvider>
            <Stack screenOptions={{ headerShadowVisible: false, headerBackButtonDisplayMode: 'minimal' }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="session" options={{ title: '' }} />
              <Stack.Screen name="formula-sheet" options={{ title: 'דף נוסחאות', presentation: 'modal' }} />
            </Stack>
          </PracticeProvider>
        </LocaleProvider>
      </ThemeProvider>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, direction: 'rtl' },
});
