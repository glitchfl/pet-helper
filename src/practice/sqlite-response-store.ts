import { openDatabaseAsync } from 'expo-sqlite';
import type { OptionNumber } from '@/bank/types';
import type { ResponseStore } from '@/engine/response-store';

type Row = {
  question_id: string;
  chosen_option: number;
  correct: number;
  answered_at: number;
  duration_ms: number;
};

export async function openSqliteResponseStore(): Promise<ResponseStore> {
  const db = await openDatabaseAsync('pet-helper.db');
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id TEXT NOT NULL,
      chosen_option INTEGER NOT NULL,
      correct INTEGER NOT NULL,
      answered_at INTEGER NOT NULL,
      duration_ms INTEGER NOT NULL
    );
  `);

  return {
    async append(response) {
      await db.runAsync(
        'INSERT INTO responses (question_id, chosen_option, correct, answered_at, duration_ms) VALUES (?, ?, ?, ?, ?)',
        response.questionId,
        response.option,
        response.correct ? 1 : 0,
        response.answeredAt,
        response.durationMs,
      );
    },

    async readAll() {
      const rows = await db.getAllAsync<Row>(
        'SELECT question_id, chosen_option, correct, answered_at, duration_ms FROM responses ORDER BY id',
      );
      return rows.map((row) => ({
        questionId: row.question_id,
        option: row.chosen_option as OptionNumber,
        correct: row.correct === 1,
        answeredAt: row.answered_at,
        durationMs: row.duration_ms,
      }));
    },
  };
}
