import { useColorScheme } from 'react-native';

const light = {
  background: '#F6F4EF',
  card: '#FFFFFF',
  text: '#1D1C1A',
  muted: '#6B675F',
  border: '#DCD7CC',
  accent: '#2D5C8A',
  onAccent: '#FFFFFF',
  correct: '#1E7A46',
  correctBg: '#E2F2E7',
  wrong: '#B3261E',
  wrongBg: '#FBE6E4',
  watermark: 'rgba(0, 0, 0, 0.055)',
};

export type Colors = typeof light;

const dark: Colors = {
  background: '#121212',
  card: '#1F1F1E',
  text: '#ECEAE5',
  muted: '#A29E96',
  border: '#3A3834',
  accent: '#8FB7E0',
  onAccent: '#10233A',
  correct: '#72CF98',
  correctBg: '#15301F',
  wrong: '#F28B82',
  wrongBg: '#3B1A18',
  watermark: 'rgba(255, 255, 255, 0.07)',
};

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}
