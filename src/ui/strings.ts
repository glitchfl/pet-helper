import type { Domain, Exam, Season } from '@/bank/types';

export const DOMAIN_NAMES: Record<Domain, string> = {
  verbal: 'חשיבה מילולית',
  quantitative: 'חשיבה כמותית',
};

export function isDomain(value: unknown): value is Domain {
  return value === 'verbal' || value === 'quantitative';
}

const SEASON_NAMES: Record<Season, string> = {
  spring: 'אביב',
  summer: 'קיץ',
  autumn: 'סתיו',
  winter: 'חורף',
};

export function examName(exam: Exam) {
  return `${exam.sample ? 'בחינת דוגמה' : 'מועד'} ${SEASON_NAMES[exam.season]} ${exam.year}`;
}

export function greeting(now: Date) {
  const hour = now.getHours();
  if (hour >= 5 && hour < 12) return 'בוקר טוב';
  if (hour >= 12 && hour < 17) return 'צהריים טובים';
  if (hour >= 17 && hour < 22) return 'ערב טוב';
  return 'לילה טוב';
}
