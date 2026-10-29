import type { Domain, Exam, OptionNumber, Question, QuestionSet, Section } from '@/bank/types';

// a bare id gets its Domain's default Question Type and Topic
export type FixtureQuestion = string | { id: string; questionType: string; topic?: string };

export type FixtureItem =
  | FixtureQuestion
  | { passage: string; questions: FixtureQuestion[] }
  | { chart: string; questions: FixtureQuestion[] };

export function passage(id: string, questions: FixtureQuestion[]): FixtureItem {
  return { passage: id, questions };
}

export function chart(id: string, questions: FixtureQuestion[]): FixtureItem {
  return { chart: id, questions };
}

export function typed(id: string, questionType: string, topic?: string): FixtureQuestion {
  return { id, questionType, topic };
}

function idOf(item: FixtureQuestion) {
  return typeof item === 'string' ? item : item.id;
}

export const CORRECT: OptionNumber = 1;
export const WRONG: OptionNumber = 2;

function question(item: FixtureQuestion, number: number, domain: Domain, questionSetId?: string): Question {
  const id = idOf(item);
  const { questionType, topic } =
    typeof item === 'string'
      ? domain === 'verbal'
        ? { questionType: 'אנלוגיות', topic: undefined }
        : { questionType: 'שאלות ובעיות', topic: 'אלגברה' }
      : item;
  return {
    id,
    number,
    questionType,
    topic,
    stem: `שאלה ${id}`,
    options: [{ text: 'א' }, { text: 'ב' }, { text: 'ג' }, { text: 'ד' }],
    correctOption: CORRECT,
    questionSetId,
  };
}

function section(number: number, domain: Domain, items: FixtureItem[], sets: QuestionSet[]): Section {
  const questions: Question[] = [];
  for (const item of items) {
    if (typeof item === 'string' || 'id' in item) {
      questions.push(question(item, questions.length + 1, domain));
      continue;
    }
    const setId = 'passage' in item ? item.passage : item.chart;
    const questionIds = item.questions.map(idOf);
    for (const member of item.questions) questions.push(question(member, questions.length + 1, domain, setId));
    sets.push(
      'passage' in item
        ? { id: setId, kind: 'passage', questionIds, text: 'קטע', lineMarkers: [] }
        : { id: setId, kind: 'chart', questionIds, image: 'chart.png' },
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
