import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import type { CurrentQuestion } from '@/engine/practice-engine';
import { REPO_URL } from '@/nite';
import { examName } from '@/ui/strings';

function appVersion() {
  const version = Constants.expoConfig?.version ?? 'unknown';
  return Updates.updateId ? `${version} (update ${Updates.updateId.slice(0, 8)})` : version;
}

export function reportUrl({ exam, section, question }: CurrentQuestion) {
  const title = `טעות בשאלה ${question.number}, פרק ${section.number}, ${examName(exam)}`;
  const body = [
    'מה לא תקין בשאלה? (למשל נוסחה משובשת או תשובה נכונה שנראית שגויה)',
    '',
    '',
    '---',
    `בחינה: ${examName(exam)} (${exam.id})`,
    `פרק: ${section.number}`,
    `שאלה: ${question.number}`,
    `מזהה השאלה: ${question.id}`,
    `גרסת האפליקציה: ${appVersion()}`,
  ].join('\n');
  return `${REPO_URL}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}
