import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { useColors } from './theme';

type Props = {
  icon: IconName;
  title: string;
  message?: string;
  tint?: string;
  children?: ReactNode;
};

export function EmptyState({ icon, title, message, tint, children }: Props) {
  const colors = useColors();
  return (
    <View style={styles.empty}>
      <View style={[styles.badge, { backgroundColor: colors.fill }]}>
        <Icon name={icon} size={30} color={tint ?? colors.textSecondary} />
      </View>
      <Text variant="title3" center>
        {title}
      </Text>
      {message && (
        <Text variant="callout" tone="secondary" center style={styles.message}>
          {message}
        </Text>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', gap: 10, paddingVertical: 48, paddingHorizontal: 24 },
  badge: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  message: { maxWidth: 300 },
});
