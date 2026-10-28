import type { OptionNumber } from '@/bank/types';

export type Response = {
  questionId: string;
  option: OptionNumber;
  correct: boolean;
  answeredAt: number;
  durationMs: number;
};

export interface ResponseStore {
  append(response: Response): Promise<void>;
  readAll(): Promise<Response[]>;
}

export function createMemoryResponseStore(initial: Response[] = []): ResponseStore {
  const responses = [...initial];
  return {
    async append(response) {
      responses.push(response);
    },
    async readAll() {
      return [...responses];
    },
  };
}
