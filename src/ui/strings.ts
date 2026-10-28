import type { Domain } from '@/bank/types';

export const DOMAIN_NAMES: Record<Domain, string> = {
  verbal: 'חשיבה מילולית',
  quantitative: 'חשיבה כמותית',
};

export function isDomain(value: unknown): value is Domain {
  return value === 'verbal' || value === 'quantitative';
}
