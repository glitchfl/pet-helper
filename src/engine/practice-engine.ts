import type { Domain, Exam, OptionNumber, Question, QuestionBank, QuestionSet, Section } from '@/bank/types';
import type { Response, ResponseStore } from './response-store';

export type Feedback = { correct: boolean; correctOption: OptionNumber };

export type CurrentQuestion = {
  exam: Exam;
  section: Section;
  questionSet?: QuestionSet;
  question: Question;
};

export type Progress = {
  total: number;
  seen: number;
  percentCorrect: number | null;
  mistakes: number;
};

export type PracticeEngine = {
  start(domain: Domain): void;
  current(): CurrentQuestion;
  respond(option: OptionNumber): Promise<Feedback>;
  skip(): void;
  next(): void;
  progress(domain: Domain): Progress;
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

function unitsOf(bank: QuestionBank, domain: Domain): Unit[] {
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
  return units;
}

export async function createPracticeEngine({ bank, store, clock, random }: Deps): Promise<PracticeEngine> {
  const latest = new Map<string, Response>();
  for (const response of await store.readAll()) latest.set(response.questionId, response);

  let units: Unit[] = [];
  let unit: Unit | undefined;
  let lastUnit: Unit | undefined;
  let position = 0;
  let shownAt = 0;
  let responded = false;

  function tier(candidate: Unit) {
    if (candidate.questions.some((question) => !latest.has(question.id))) return UNSEEN;
    if (candidate.questions.some((question) => !latest.get(question.id)?.correct)) return MISTAKE;
    return REST;
  }

  function show(index: number) {
    position = index;
    shownAt = clock();
    responded = false;
  }

  function serveNextUnit() {
    const candidates = units.length > 1 ? units.filter((candidate) => candidate !== lastUnit) : units;
    const best = Math.min(...candidates.map(tier));
    const pool = candidates.filter((candidate) => tier(candidate) === best);
    unit = pool[Math.floor(random() * pool.length)];
    lastUnit = unit;
    show(0);
  }

  function requireUnit() {
    if (!unit) throw new Error('Free Practice has not been started');
    return unit;
  }

  function advance() {
    if (position + 1 < requireUnit().questions.length) show(position + 1);
    else serveNextUnit();
  }

  function current(): CurrentQuestion {
    const { exam, section, questionSet, questions } = requireUnit();
    return { exam, section, questionSet, question: questions[position] };
  }

  return {
    start(domain) {
      units = unitsOf(bank, domain);
      if (units.length === 0) throw new Error(`the Question Bank has no ${domain} Questions`);
      serveNextUnit();
    },

    current,

    async respond(option) {
      const { question } = current();
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
      return { correct: response.correct, correctOption: question.correctOption };
    },

    skip() {
      const { question } = current();
      if (responded) throw new Error(`Question ${question.id} already has a Response`);
      advance();
    },

    next() {
      const { question } = current();
      if (!responded) throw new Error(`Question ${question.id} has no Response yet`);
      advance();
    },

    progress(domain) {
      const questions = unitsOf(bank, domain).flatMap((candidate) => candidate.questions);
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
  };
}
