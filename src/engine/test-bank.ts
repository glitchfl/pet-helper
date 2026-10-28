import type { Domain, Exam, OptionNumber, Question, QuestionSet, Section } from '@/bank/types';

export type FixtureItem = string | { passage: string; questions: string[] } | { chart: string; questions: string[] };

export function passage(id: string, questions: string[]): FixtureItem {
  return { passage: id, questions };
}

export function chart(id: string, questions: string[]): FixtureItem {
  return { chart: id, questions };
}

export const CORRECT: OptionNumber = 1;
export const WRONG: OptionNumber = 2;

function question(id: string, number: number, domain: Domain, questionSetId?: string): Question {
  return {
    id,
    number,
    questionType: domain === 'verbal' ? 'אנלוגיות' : 'שאלות ובעיות',
    topic: domain === 'quantitative' ? 'אלגברה' : undefined,
    stem: `שאלה ${id}`,
    options: [{ text: 'א' }, { text: 'ב' }, { text: 'ג' }, { text: 'ד' }],
    correctOption: CORRECT,
    questionSetId,
  };
}

function section(number: number, domain: Domain, items: FixtureItem[], sets: QuestionSet[]): Section {
  const questions: Question[] = [];
  for (const item of items) {
    if (typeof item === 'string') {
      questions.push(question(item, questions.length + 1, domain));
      continue;
    }
    const setId = 'passage' in item ? item.passage : item.chart;
    for (const id of item.questions) questions.push(question(id, questions.length + 1, domain, setId));
    sets.push(
      'passage' in item
        ? { id: setId, kind: 'passage', questionIds: item.questions, text: 'קטע', lineMarkers: [] }
        : { id: setId, kind: 'chart', questionIds: item.questions, image: 'chart.png' },
    );
  }
  return { number, domain, questions };
}

export function fixtureBank(items: { verbal?: FixtureItem[]; quantitative?: FixtureItem[] }): Exam[] {
  const questionSets: QuestionSet[] = [];
  const sections = [
    section(1, 'verbal', items.verbal ?? [], questionSets),
    section(2, 'quantitative', items.quantitative ?? [], questionSets),
  ];
  return [{ id: 'fixture', season: 'summer', year: 2026, sample: true, sections, questionSets }];
}

export function fakeClock(start = 1_000_000) {
  let now = start;
  return {
    now: () => now,
    advance(ms: number) {
      now += ms;
    },
  };
}

export function seededRandom(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
