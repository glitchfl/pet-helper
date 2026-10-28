import { Text, type StyleProp, type TextStyle } from 'react-native';
import type { RichText as RichTextValue } from '@/bank/types';

export function RichText({ value, style }: { value: RichTextValue; style?: StyleProp<TextStyle> }) {
  return <Text style={style}>{value}</Text>;
}
