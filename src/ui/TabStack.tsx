import { Stack } from 'expo-router';
import { useColors } from './theme';

// every tab is a native stack with an ios large title that collapses on scroll
// the header has no background color - ios 26 hides a large title drawn over one
export function TabStack({ title }: { title: string }) {
  const colors = useColors();
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        headerLargeTitleShadowVisible: false,
        headerTintColor: colors.accentText,
        headerTitleStyle: { color: colors.text },
        headerLargeTitleStyle: { color: colors.text },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title, headerLargeTitleEnabled: true }} />
    </Stack>
  );
}
