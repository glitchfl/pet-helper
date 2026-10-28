import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useColors } from './theme';

type Props = {
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

// the first scroll view of a tab gets the native large-title and tab-bar insets automatically on ios
export function ScrollScreen({ children, contentStyle }: Props) {
  const colors = useColors();
  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, contentStyle]}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40, gap: 24 },
});
