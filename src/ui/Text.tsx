import { Text as NativeText, type TextProps, type TextStyle } from 'react-native';
import { type, useColors, type Colors, type TypeVariant } from './theme';

type Tone = 'primary' | 'secondary' | 'tertiary' | 'accent' | 'correct' | 'wrong' | 'onAccent';

type Props = TextProps & {
  variant?: TypeVariant;
  tone?: Tone;
  color?: string;
  weight?: TextStyle['fontWeight'];
  center?: boolean;
  tabular?: boolean;
};

function toneColor(colors: Colors, tone: Tone) {
  switch (tone) {
    case 'secondary':
      return colors.textSecondary;
    case 'tertiary':
      return colors.textTertiary;
    case 'accent':
      return colors.accentText;
    case 'correct':
      return colors.correct;
    case 'wrong':
      return colors.wrong;
    case 'onAccent':
      return colors.onAccent;
    default:
      return colors.text;
  }
}

// alignment is left to the layout direction: the app forces rtl, so the default already starts on the right
export function Text({ variant = 'body', tone = 'primary', color, weight, center, tabular, style, ...props }: Props) {
  const colors = useColors();
  return (
    <NativeText
      maxFontSizeMultiplier={1.6}
      {...props}
      style={[
        type[variant],
        { color: color ?? toneColor(colors, tone) },
        weight !== undefined && { fontWeight: weight },
        center && { textAlign: 'center' },
        tabular && { fontVariant: ['tabular-nums'] },
        style,
      ]}
    />
  );
}
