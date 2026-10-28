import type { Domain, Exam, OptionNumber, Question, QuestionBank, Section } from '@/bank/types';
import type { ResponseStore } from './response-store';

export type Feedback = { correct: boolean; correctOption: OptionNumber };

export type CurrentQuestion = {
  exam: Exam;
  section: Section;
  question: Question;
};

export type PracticeEngine = {
  start(domain: Domain): void;
  current(): CurrentQuestion;
  respond(option: OptionNumber): Promise<Feedback>;
  next(): void;
};

type Deps = {
  bank: QuestionBank;
  store: ResponseStore;
  clock: () => number;
  random: () => number;
};

export async function createPracticeEngine({ bank, random }: Deps): Promise<PracticeEngine> {
  let pool: CurrentQuestion[] = [];
  let current: CurrentQuestion | undefined;
  let responded = false;

  function requireCurrent() {
    if (!current) throw new Error('Free Practice has not been started');
    return current;
  }

  function serve(candidates: CurrentQuestion[]) {
    current = candidates[Math.floor(random() * candidates.length)];
    responded = false;
  }

  return {
    start(domain) {
      pool = bank.flatMap((exam) =>
        exam.sections
          .filter((section) => section.domain === domain)
          .flatMap((section) => section.questions.map((question) => ({ exam, section, question }))),
      );
      if (pool.length === 0) throw new Error(`the Question Bank has no ${domain} Questions`);
      serve(pool);
    },

    current: requireCurrent,

    async respond(option) {
      const { question } = requireCurrent();
      if (responded) throw new Error(`Question ${question.id} already has a Response`);
      responded = true;
      return { correct: option === question.correctOption, correctOption: question.correctOption };
    },

    next() {
      const served = requireCurrent();
      if (!responded) throw new Error(`Question ${served.question.id} has no Response yet`);
      const others = pool.filter((candidate) => candidate !== served);
      serve(others.length > 0 ? others : pool);
    },
  };
}
