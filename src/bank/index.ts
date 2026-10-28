import type { Exam, ImagePath, QuestionBank } from './types';

const examFiles = require.context('../../bank', true, /\/exam\.json$/);
const imageFiles = require.context('../../bank', true, /\.(png|jpe?g)$/);

const folderOfExam = new Map<string, string>();

export const questionBank: QuestionBank = examFiles.keys().map((key) => {
  const exam = examFiles(key) as Exam;
  folderOfExam.set(exam.id, key.slice(0, key.lastIndexOf('/')));
  return exam;
});

export function imageSource(examId: string, path: ImagePath): number {
  return imageFiles(`${folderOfExam.get(examId)}/${path}`);
}
