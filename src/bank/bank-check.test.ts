import { checkBank } from './bank-check';
import type { Exam, Question } from './types';
import { chart, fixtureBank, passage } from '@/engine/test-bank';

const imagesExist = { imageExists: () => true };

function wellFormed() {
  return fixtureBank({
    verbal: ['v1', passage('p1', ['v2', 'v3']), 'v4'],
    quantitative: ['q1', chart('c1', ['q2', 'q3'])],
  });
}

function question(bank: Exam[], id: string): Question {
  const found = bank.flatMap((exam) => exam.sections.flatMap((section) => section.questions)).find((q) => q.id === id);
  if (!found) throw new Error(`no fixture Question ${id}`);
  return found;
}

function expectOneProblemAbout(problems: string[], id: string) {
  expect(problems).toHaveLength(1);
  expect(problems[0]).toContain(id);
}

test('a well-formed bank has no problems', () => {
  expect(checkBank(wellFormed(), imagesExist)).toEqual([]);
});

test('a Question without exactly four Options fails', () => {
  const bank = wellFormed();
  question(bank, 'v4').options.pop();

  expectOneProblemAbout(checkBank(bank, imagesExist), 'v4');
});

test('a Correct Option outside 1-4 fails', () => {
  const bank = wellFormed();
  Object.assign(question(bank, 'q1'), { correctOption: 5 });

  expectOneProblemAbout(checkBank(bank, imagesExist), 'q1');
});

test('a Question with no Correct Option fails', () => {
  const bank = wellFormed();
  delete (question(bank, 'v1') as Partial<Question>).correctOption;

  expectOneProblemAbout(checkBank(bank, imagesExist), 'v1');
});

test('a Question without a Question Type fails', () => {
  const bank = wellFormed();
  question(bank, 'v2').questionType = ' ';

  expectOneProblemAbout(checkBank(bank, imagesExist), 'v2');
});

test('a Quantitative Question without a Topic fails', () => {
  const bank = wellFormed();
  delete question(bank, 'q3').topic;

  expectOneProblemAbout(checkBank(bank, imagesExist), 'q3');
});

function ids(prefix: string, count: number) {
  return Array.from({ length: count }, (_, i) => `${prefix}${i + 1}`);
}

function approvedExam(verbalCount: number, quantitativeCount: number) {
  const bank = fixtureBank({ verbal: ids('v', verbalCount), quantitative: ids('q', quantitativeCount) });
  bank[0].sample = false;
  return bank;
}

test('Sections of 23 Verbal and 20 Quantitative Questions pass', () => {
  expect(checkBank(approvedExam(23, 20), imagesExist)).toEqual([]);
});

test('a Section with the wrong Question count for its Domain fails', () => {
  expectOneProblemAbout(checkBank(approvedExam(22, 20), imagesExist), 'Section 1');
});

test('sample Exams are exempt from the Question count rule', () => {
  const bank = approvedExam(5, 3);
  bank[0].sample = true;

  expect(checkBank(bank, imagesExist)).toEqual([]);
});

function questionSet(bank: Exam[], id: string) {
  const found = bank[0].questionSets.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`no fixture Question Set ${id}`);
  return found;
}

test('Question Set members that are not consecutive fail', () => {
  const bank = wellFormed();
  questionSet(bank, 'p1').questionIds = ['v2', 'v4'];
  delete question(bank, 'v3').questionSetId;
  question(bank, 'v4').questionSetId = 'p1';

  expectOneProblemAbout(checkBank(bank, imagesExist), 'p1');
});

test('Question Set members listed out of printed order fail', () => {
  const bank = wellFormed();
  questionSet(bank, 'c1').questionIds = ['q3', 'q2'];

  expectOneProblemAbout(checkBank(bank, imagesExist), 'c1');
});

test('a Question pointing at a Question Set that does not list it fails', () => {
  const bank = wellFormed();
  question(bank, 'v4').questionSetId = 'p1';

  expectOneProblemAbout(checkBank(bank, imagesExist), 'v4');
});

test('a referenced image that does not exist fails', () => {
  const bank = wellFormed();
  question(bank, 'q1').figure = 'images/q1-figure.png';
  question(bank, 'q1').options[2] = { image: 'images/q1-option3.png' };
  bank[0].formulaSheet = 'images/formula-sheet.png';
  const missing = new Set(['images/q1-option3.png', 'chart.png', 'images/formula-sheet.png']);

  const problems = checkBank(bank, { imageExists: (_exam, path) => !missing.has(path) });

  expect(problems).toHaveLength(3);
  for (const path of missing) expect(problems.join('\n')).toContain(path);
});

test('two items sharing an id fail', () => {
  const bank = wellFormed();
  question(bank, 'q1').id = 'v1';

  expectOneProblemAbout(checkBank(bank, imagesExist), 'v1');
});

test('a Question Set sharing an id with a Question fails', () => {
  const bank = wellFormed();
  questionSet(bank, 'c1').id = 'q1';
  question(bank, 'q2').questionSetId = 'q1';
  question(bank, 'q3').questionSetId = 'q1';

  expectOneProblemAbout(checkBank(bank, imagesExist), 'q1');
});

test('math that cannot be typeset fails', () => {
  const bank = wellFormed();
  question(bank, 'q2').stem = 'מהו $\\frac{1}{2$?';
  question(bank, 'q3').options[0] = { text: 'בערך $3' };

  const problems = checkBank(bank, imagesExist);

  expect(problems).toHaveLength(2);
  expect(problems[0]).toContain('q2');
  expect(problems[1]).toContain('q3');
});
