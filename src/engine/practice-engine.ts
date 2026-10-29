import type { Domain, Exam, OptionNumber, Question, QuestionBank, QuestionSet, Section } from '@/bank/types';
import type { Response, ResponseStore } from './response-store';

export type Feedback = { correct: boolean; correctOption: OptionNumber; durationMs: number };

export type CurrentQuestion = {
  exam: Exam;
  section: Section;
  questionSet?: QuestionSet;
  question: Question;
};

// a Question Type, narrowed to one of its Topics when the type spans several
export type Focus = { questionType: string; topic?: string };

export type Mode = { kind: 'free' } | { kind: 'drill'; focus: Focus[] } | { kind: 'mistakes' };

export type RecapItem = CurrentQuestion & {
  outcome: 'correct' | 'wrong' | 'skipped';
  option?: OptionNumber;
  durationMs?: number;
};

export type Recap = { items: RecapItem[]; durationMs: number };

export type RoundProgress = { done: number; total: number };

export type Progress = {
  total: number;
  seen: number;
  percentCorrect: number | null;
  mistakes: number;
};

export type PracticeEngine = {
  // false when the Mode has nothing to serve, like a Mistakes Review with no Mistakes
  start(domain: Domain, mode?: Mode): boolean;
  current(): CurrentQuestion;
  respond(option: OptionNumber): Promise<Feedback>;
  skip(): void;
  next(): void;
  round(): RoundProgress;
  // only set once the last Question of the Round has been passed
  recap(): Recap | undefined;
  nextRound(): boolean;
  progress(domain: Domain, focus?: Focus[]): Progress;
  focuses(domain: Domain): Focus[];
};

type Deps = {
  bank: QuestionBank;
  store: ResponseStore;
  clock: () => number;
  random: () => number;
};

type Unit = {
  exam: Exam;
  section: Section;
  questionSet?: QuestionSet;
  questions: Question[];
};

const UNSEEN = 0;
const MISTAKE = 1;
const REST = 2;

const ROUND_TARGET = 10;
const ROUND_CAP = 13;

function inFocus(question: Question, focus: Focus[]) {
  return focus.some(
    ({ questionType, topic }) =>
      questionType === question.questionType && (topic === undefined || topic === question.topic),
  );
}

function unitsOf(bank: QuestionBank, domain: Domain, keep?: (question: Question) => boolean): Unit[] {
  const units: Unit[] = [];
  for (const exam of bank) {
    const sets = new Map(exam.questionSets.map((questionSet) => [questionSet.id, questionSet]));
    for (const section of exam.sections) {
      if (section.domain !== domain) continue;
      const setUnits = new Map<string, Unit>();
      for (const question of section.questions) {
        const questionSet = question.questionSetId ? sets.get(question.questionSetId) : undefined;
        if (!questionSet) {
          units.push({ exam, section, questions: [question] });
          continue;
        }
        let unit = setUnits.get(questionSet.id);
        if (!unit) {
          unit = { exam, section, questionSet, questions: [] };
          setUnits.set(questionSet.id, unit);
          units.push(unit);
        }
        unit.questions.push(question);
      }
    }
  }
  if (!keep) return units;
  return units.flatMap((unit) => {
    const questions = unit.questions.filter(keep);
    return questions.length > 0 ? [{ ...unit, questions }] : [];
  });
}

// units are rebuilt every Round, so the one that closed the last Round is recognised by its key
function keyOf(unit: Unit) {
  return unit.questionSet?.id ?? unit.questions[0].id;
}

function sizeOf(units: Unit[]) {
  return units.reduce((size, unit) => size + unit.questions.length, 0);
}

function biggestFirst<T>(counts: Map<T, number>, name: (key: T) => string): T[] {
  return [...counts.keys()].sort((a, b) => counts.get(b)! - counts.get(a)! || name(a).localeCompare(name(b), 'he'));
}

function focusesOf(bank: QuestionBank, domain: Domain): Focus[] {
  const typeCounts = new Map<string, number>();
  const topicCounts = new Map<string, Map<string | undefined, number>>();
  for (const question of unitsOf(bank, domain).flatMap((unit) => unit.questions)) {
    const { questionType, topic } = question;
    typeCounts.set(questionType, (typeCounts.get(questionType) ?? 0) + 1);
    const topics = topicCounts.get(questionType) ?? new Map<string | undefined, number>();
    topics.set(topic, (topics.get(topic) ?? 0) + 1);
    topicCounts.set(questionType, topics);
  }
  return biggestFirst(typeCounts, (questionType) => questionType).flatMap((questionType) => {
    const topics = topicCounts.get(questionType)!;
    if (topics.size === 1) return [{ questionType }];
    return biggestFirst(topics, (topic) => topic ?? '').map((topic) => ({ questionType, topic }));
  });
}

export async function createPracticeEngine({ bank, store, clock, random }: Deps): Promise<PracticeEngine> {
  const latest = new Map<string, Response>();
  for (const response of await store.readAll()) latest.set(response.questionId, response);

  let candidates: () => Unit[] = () => [];
  let round: Unit[] = [];
  let unitIndex = 0;
  let position = 0;
  let shownAt = 0;
  let responded = false;
  let roundStartedAt = 0;
  let items: RecapItem[] = [];
  let recap: Recap | undefined;
  let closingKey: string | undefined;

  const isMistake = (question: Question) => latest.get(question.id)?.correct === false;

  function keepFor(mode: Mode) {
    switch (mode.kind) {
      case 'free':
        return undefined;
      case 'drill':
        return (question: Question) => inFocus(question, mode.focus);
      case 'mistakes':
        return isMistake;
    }
  }

  function tier(candidate: Unit) {
    if (candidate.questions.some((question) => !latest.has(question.id))) return UNSEEN;
    if (candidate.questions.some(isMistake)) return MISTAKE;
    return REST;
  }

  function shuffled<T>(list: T[]) {
    const result = [...list];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function planRound() {
    const ordered = shuffled(candidates()).sort((a, b) => tier(a) - tier(b));
    if (ordered.length > 1 && keyOf(ordered[0]) === closingKey) [ordered[0], ordered[1]] = [ordered[1], ordered[0]];

    const planned: Unit[] = [];
    let size = 0;
    for (const unit of ordered) {
      if (size >= ROUND_TARGET) break;
      // a Question Set too big for what's left of the Round waits for the next one
      if (planned.length > 0 && size + unit.questions.length > ROUND_CAP) continue;
      planned.push(unit);
      size += unit.questions.length;
    }
    return planned;
  }

  function show(index: number) {
    position = index;
    shownAt = clock();
    responded = false;
  }

  function nextRound() {
    const planned = planRound();
    if (planned.length === 0) return false;
    round = planned;
    unitIndex = 0;
    items = [];
    recap = undefined;
    roundStartedAt = clock();
    show(0);
    return true;
  }

  function requireUnit() {
    if (round.length === 0) throw new Error('practice has not been started');
    if (recap) throw new Error('the Round is over');
    return round[unitIndex];
  }

  function advance() {
    const unit = requireUnit();
    if (position + 1 < unit.questions.length) {
      show(position + 1);
    } else if (unitIndex + 1 < round.length) {
      unitIndex += 1;
      show(0);
    } else {
      closingKey = keyOf(unit);
      recap = { items, durationMs: clock() - roundStartedAt };
    }
  }

  function current(): CurrentQuestion {
    const { exam, section, questionSet, questions } = requireUnit();
    return { exam, section, questionSet, question: questions[position] };
  }

  return {
    start(domain, mode = { kind: 'free' }) {
      const keep = keepFor(mode);
      candidates = () => unitsOf(bank, domain, keep);
      round = [];
      closingKey = undefined;
      return nextRound();
    },

    current,

    async respond(option) {
      const served = current();
      const { question } = served;
      if (responded) throw new Error(`Question ${question.id} already has a Response`);
      responded = true;
      const answeredAt = clock();
      const response: Response = {
        questionId: question.id,
        option,
        correct: option === question.correctOption,
        answeredAt,
        durationMs: answeredAt - shownAt,
      };
      try {
        await store.append(response);
      } catch (error) {
        responded = false;
        throw error;
      }
      latest.set(question.id, response);
      items.push({ ...served, outcome: response.correct ? 'correct' : 'wrong', option, durationMs: response.durationMs });
      return { correct: response.correct, correctOption: question.correctOption, durationMs: response.durationMs };
    },

    skip() {
      const served = current();
      if (responded) throw new Error(`Question ${served.question.id} already has a Response`);
      items.push({ ...served, outcome: 'skipped' });
      advance();
    },

    next() {
      const { question } = current();
      if (!responded) throw new Error(`Question ${question.id} has no Response yet`);
      advance();
    },

    round() {
      return { done: items.length, total: sizeOf(round) };
    },

    recap() {
      return recap;
    },

    nextRound,

    progress(domain, focus) {
      const questions = unitsOf(bank, domain, focus && ((question) => inFocus(question, focus))).flatMap(
        (candidate) => candidate.questions,
      );
      const latestResponses = questions.flatMap((question) => latest.get(question.id) ?? []);
      const correct = latestResponses.filter((response) => response.correct).length;
      const seen = latestResponses.length;
      return {
        total: questions.length,
        seen,
        percentCorrect: seen === 0 ? null : Math.round((correct / seen) * 100),
        mistakes: seen - correct,
      };
    },

    focuses(domain) {
      return focusesOf(bank, domain);
    },
  };
}
