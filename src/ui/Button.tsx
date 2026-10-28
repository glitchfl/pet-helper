import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { haptics } from './haptics';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { radius, useColors } from './theme';

type Variant = 'primary' | 'secondary' | 'plain' | 'destructive';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: IconName;
  disabled?: boolean;
  compact?: boolean;
  tint?: string;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, variant = 'primary', icon, disabled, compact, tint, style }: Props) {
  const colors = useColors();
  const accent = tint ?? colors.accent;
  const look = {
    primary: { background: accent, text: colors.onAccent },
    secondary: { background: colors.fill, text: tint ?? colors.accentText },
    plain: { background: 'transparent', text: tint ?? colors.accentText },
    destructive: { background: colors.wrongSoft, text: colors.wrong },
  }[variant];

  return (
    <PressableScale
      onPress={() => {
        if (variant === 'primary') haptics.light();
        onPress();
      }}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      scaleTo={0.96}
      style={[
        styles.button,
        compact && styles.compact,
        { backgroundColor: look.background, opacity: disabled ? 0.38 : 1 },
        style,
      ]}
    >
      <View style={styles.content}>
        {icon && <Icon name={icon} size={compact ? 15 : 17} color={look.text} />}
        <Text variant={compact ? 'subhead' : 'headline'} color={look.text} weight="600">
          {label}
        </Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: radius.button,
    borderCurve: 'continuous',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compact: { minHeight: 38, borderRadius: 12, paddingHorizontal: 14 },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
