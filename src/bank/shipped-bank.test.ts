/// <reference types="node" />
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { checkBank } from './bank-check';
import type { Exam } from './types';

const BANK_DIR = join(__dirname, '..', '..', 'bank');

// listed rather than stat'ed so a case mismatch fails here too and not only on a phone
// only formats that src/bank/index.ts bundles count as existing
function bundledImages(folder: string) {
  return new Set(
    readdirSync(join(BANK_DIR, folder), { recursive: true, encoding: 'utf8' })
      .map((path) => path.split('\\').join('/'))
      .filter((path) => /\.(png|jpe?g)$/.test(path)),
  );
}

function typesetMath(folder: string): Set<string> {
  const path = join(BANK_DIR, folder, 'math.json');
  if (!existsSync(path)) return new Set();
  return new Set(Object.keys(JSON.parse(readFileSync(path, 'utf8')).math));
}

test('the shipped Question Bank passes the Bank Check', () => {
  const folders = readdirSync(BANK_DIR, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  const exams = folders.map((folder) => {
    const exam: Exam = JSON.parse(readFileSync(join(BANK_DIR, folder.name, 'exam.json'), 'utf8'));
    return { exam, images: bundledImages(folder.name), math: typesetMath(folder.name) };
  });
  const entryOf = (exam: Exam) => exams.find((entry) => entry.exam === exam);

  const problems = checkBank(
    exams.map(({ exam }) => exam),
    {
      imageExists: (exam, path) => entryOf(exam)?.images.has(path) ?? false,
      mathTypeset: (exam, latex) => entryOf(exam)?.math.has(latex) ?? false,
    },
  );

  expect(exams.length).toBeGreaterThan(0);
  expect(problems).toEqual([]);
});
