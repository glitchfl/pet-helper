import { Children, Fragment, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { radius, useColors } from './theme';

type SectionProps = {
  title?: string;
  footer?: string;
  children: ReactNode;
};

// an inset grouped list, the way settings-style screens look on ios
export function ListSection({ title, footer, children }: SectionProps) {
  const colors = useColors();
  const rows = Children.toArray(children).filter(Boolean);

  return (
    <View style={styles.section}>
      {title && (
        <Text variant="footnote" tone="secondary" weight="600" style={styles.sectionTitle}>
          {title}
        </Text>
      )}
      <View style={[styles.group, { backgroundColor: colors.surface }]}>
        {rows.map((row, index) => (
          <Fragment key={index}>
            {index > 0 && <View style={[styles.separator, { backgroundColor: colors.separator }]} />}
            {row}
          </Fragment>
        ))}
      </View>
      {footer && (
        <Text variant="footnote" tone="secondary" style={styles.footer}>
          {footer}
        </Text>
      )}
    </View>
  );
}

type RowProps = {
  title: string;
  subtitle?: string;
  value?: string;
  icon?: IconName;
  iconColor?: string;
  accessory?: ReactNode;
  chevron?: boolean;
  checked?: boolean;
  destructive?: boolean;
  onPress?: () => void;
};

export function ListRow({ title, subtitle, value, icon, iconColor, accessory, chevron, checked, destructive, onPress }: RowProps) {
  const colors = useColors();
  const checkable = checked !== undefined;
  const showChevron = chevron ?? (onPress !== undefined && !checkable);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={checkable ? 'checkbox' : onPress ? 'button' : undefined}
      accessibilityState={checkable ? { checked } : undefined}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.fill }]}
    >
      {icon && (
        <View style={[styles.iconBadge, { backgroundColor: iconColor ?? colors.accent }]}>
          <Icon name={icon} size={15} color="#FFFFFF" />
        </View>
      )}
      <View style={styles.rowText}>
        <Text variant="body" color={destructive ? colors.wrong : undefined}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="footnote" tone="secondary">
            {subtitle}
          </Text>
        )}
      </View>
      {value !== undefined && (
        <Text variant="body" tone="secondary" tabular>
          {value}
        </Text>
      )}
      {accessory}
      {checked && <Icon name="check" size={17} color={colors.accent} />}
      {showChevron && <Icon name="forward" size={13} color={colors.textTertiary} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  sectionTitle: { paddingHorizontal: 16, textTransform: 'uppercase' },
  group: { borderRadius: radius.row, borderCurve: 'continuous', overflow: 'hidden' },
  separator: { height: StyleSheet.hairlineWidth, marginStart: 16 },
  footer: { paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, minHeight: 50 },
  iconBadge: { width: 29, height: 29, borderRadius: 8, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: 2 },
});
