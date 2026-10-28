import katex from 'katex';
import { parseRichText } from './rich-text';
import type { Domain, Exam, ImagePath, RichText } from './types';

const QUESTIONS_PER_SECTION: Record<Domain, number> = { verbal: 23, quantitative: 20 };

type Options = {
  imageExists: (exam: Exam, path: ImagePath) => boolean;
};

function mathProblem(value: RichText): string | undefined {
  try {
    for (const segment of parseRichText(value)) {
      if (segment.kind === 'math') katex.renderToString(segment.latex, { throwOnError: true });
    }
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

export function checkBank(bank: Exam[], { imageExists }: Options): string[] {
  const problems: string[] = [];
  const seenIds = new Set<string>();

  function claimId(id: string) {
    if (seenIds.has(id)) problems.push(`${id}: the id is used more than once`);
    seenIds.add(id);
  }

  for (const exam of bank) {
    claimId(exam.id);
    const image = (owner: string, path: ImagePath) => {
      if (!imageExists(exam, path)) problems.push(`${owner}: image ${path} does not exist`);
    };
    if (exam.formulaSheet) image(exam.id, exam.formulaSheet);

    for (const section of exam.sections) {
      const expected = QUESTIONS_PER_SECTION[section.domain];
      if (!exam.sample && section.questions.length !== expected) {
        problems.push(
          `${exam.id} Section ${section.number}: has ${section.questions.length} ${section.domain} Questions instead of ${expected}`,
        );
      }

      for (const question of section.questions) {
        const problem = (text: string) => problems.push(`${question.id}: ${text}`);
        const math = (value: RichText) => {
          const error = mathProblem(value);
          if (error) problem(`has math that cannot be typeset - ${error}`);
        };
        claimId(question.id);

        if (question.options.length !== 4) problem(`has ${question.options.length} Options instead of 4`);
        if (question.correctOption === undefined) problem('has no Correct Option');
        else if (![1, 2, 3, 4].includes(question.correctOption)) {
          problem(`has Correct Option ${question.correctOption}, outside 1-4`);
        }
        if (!question.questionType?.trim()) problem('has no Question Type');
        if (section.domain === 'quantitative' && !question.topic?.trim()) problem('is Quantitative but has no Topic');

        const listing = exam.questionSets.find((questionSet) => questionSet.id === question.questionSetId);
        if (question.questionSetId && !listing?.questionIds.includes(question.id)) {
          problem(`points at Question Set ${question.questionSetId}, which does not list it`);
        }

        math(question.stem);
        if (question.figure) image(question.id, question.figure);
        for (const option of question.options) {
          if ('image' in option) image(question.id, option.image);
          else math(option.text);
        }
      }
    }

    for (const questionSet of exam.questionSets) {
      claimId(questionSet.id);
      if (questionSet.kind === 'chart') image(questionSet.id, questionSet.image);

      const first = questionSet.questionIds[0];
      const section = exam.sections.find((candidate) => candidate.questions.some((question) => question.id === first));
      const start = section?.questions.findIndex((question) => question.id === first) ?? -1;
      const consecutive = questionSet.questionIds.every((id, offset) => {
        const question = section?.questions[start + offset];
        return question?.id === id && question.questionSetId === questionSet.id;
      });
      if (!section || !consecutive) {
        problems.push(`${questionSet.id}: Question Set members are not consecutive Questions of one Section in printed order`);
      }
    }
  }

  return problems;
}
