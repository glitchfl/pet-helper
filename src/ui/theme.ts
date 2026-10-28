import { useColorScheme, type TextStyle } from 'react-native';
import type { Domain } from '@/bank/types';

const light = {
  background: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  fill: 'rgba(118, 118, 128, 0.12)',
  fillStrong: 'rgba(118, 118, 128, 0.2)',
  text: '#0B0B0F',
  textSecondary: 'rgba(60, 60, 67, 0.66)',
  textTertiary: 'rgba(60, 60, 67, 0.38)',
  separator: 'rgba(60, 60, 67, 0.16)',
  border: 'rgba(60, 60, 67, 0.14)',
  accent: '#3E5BD9',
  accentText: '#3450C8',
  accentSoft: 'rgba(62, 91, 217, 0.11)',
  onAccent: '#FFFFFF',
  verbal: '#7A4FD6',
  verbalSoft: 'rgba(122, 79, 214, 0.11)',
  quantitative: '#0C9483',
  quantitativeSoft: 'rgba(12, 148, 131, 0.11)',
  correct: '#1C9A52',
  correctSoft: 'rgba(28, 154, 82, 0.11)',
  wrong: '#E0424A',
  wrongSoft: 'rgba(224, 66, 74, 0.1)',
  warning: '#D97A06',
  warningSoft: 'rgba(217, 122, 6, 0.12)',
  streak: '#FF7A1A',
  watermark: 'rgba(0, 0, 0, 0.045)',
  shadow: 'rgba(16, 24, 40, 0.08)',
  scrim: 'rgba(0, 0, 0, 0.4)',
};

export type Colors = typeof light;

const dark: Colors = {
  background: '#000000',
  surface: '#1C1C1E',
  surfaceRaised: '#2C2C2E',
  fill: 'rgba(118, 118, 128, 0.24)',
  fillStrong: 'rgba(118, 118, 128, 0.34)',
  text: '#F5F5F7',
  textSecondary: 'rgba(235, 235, 245, 0.62)',
  textTertiary: 'rgba(235, 235, 245, 0.32)',
  separator: 'rgba(84, 84, 88, 0.6)',
  border: 'rgba(84, 84, 88, 0.55)',
  accent: '#5574F2',
  accentText: '#8FA3FF',
  accentSoft: 'rgba(85, 116, 242, 0.2)',
  onAccent: '#FFFFFF',
  verbal: '#A783F2',
  verbalSoft: 'rgba(167, 131, 242, 0.18)',
  quantitative: '#2DC4AF',
  quantitativeSoft: 'rgba(45, 196, 175, 0.16)',
  correct: '#3DD68C',
  correctSoft: 'rgba(61, 214, 140, 0.15)',
  wrong: '#FF6369',
  wrongSoft: 'rgba(255, 99, 105, 0.15)',
  warning: '#FFB224',
  warningSoft: 'rgba(255, 178, 36, 0.16)',
  streak: '#FF8A3D',
  watermark: 'rgba(255, 255, 255, 0.06)',
  shadow: 'rgba(0, 0, 0, 0)',
  scrim: 'rgba(0, 0, 0, 0.6)',
};

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}

export function domainColors(colors: Colors, domain: Domain) {
  return domain === 'verbal'
    ? { tint: colors.verbal, soft: colors.verbalSoft }
    : { tint: colors.quantitative, soft: colors.quantitativeSoft };
}

// apple's text styles, with hebrew-friendly line heights
export const type = {
  largeTitle: { fontSize: 34, lineHeight: 42, fontWeight: '700' },
  title1: { fontSize: 28, lineHeight: 35, fontWeight: '700' },
  title2: { fontSize: 22, lineHeight: 29, fontWeight: '700' },
  title3: { fontSize: 20, lineHeight: 26, fontWeight: '600' },
  headline: { fontSize: 17, lineHeight: 23, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 25 },
  callout: { fontSize: 16, lineHeight: 22 },
  subhead: { fontSize: 15, lineHeight: 21 },
  footnote: { fontSize: 13, lineHeight: 18 },
  caption: { fontSize: 12, lineHeight: 16 },
} satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;

export const radius = { card: 22, row: 16, button: 16, chip: 10 };
