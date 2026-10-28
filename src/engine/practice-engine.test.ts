import { createPracticeEngine } from './practice-engine';
import { createMemoryResponseStore } from './response-store';
import { CORRECT, WRONG, fakeClock, fixtureBank, seededRandom } from './test-bank';
import type { Exam } from '@/bank/types';

async function engineFor(bank: Exam[], options: { random?: () => number } = {}) {
  const store = createMemoryResponseStore();
  const clock = fakeClock();
  const engine = await createPracticeEngine({
    bank,
    store,
    clock: clock.now,
    random: options.random ?? seededRandom(1),
  });
  return { engine, store, clock };
}

describe('responding', () => {
  test('the Correct Option is reported as correct', async () => {
    const { engine } = await engineFor(fixtureBank({ verbal: ['v1'] }));
    engine.start('verbal');

    expect(await engine.respond(CORRECT)).toEqual({ correct: true, correctOption: CORRECT });
  });

  test('a wrong Option is reported as wrong along with the Correct Option', async () => {
    const { engine } = await engineFor(fixtureBank({ verbal: ['v1'] }));
    engine.start('verbal');

    expect(await engine.respond(WRONG)).toEqual({ correct: false, correctOption: CORRECT });
  });

  test('the Options are locked once the Question has a Response', async () => {
    const { engine } = await engineFor(fixtureBank({ verbal: ['v1'] }));
    engine.start('verbal');
    await engine.respond(WRONG);

    await expect(engine.respond(CORRECT)).rejects.toThrow();
  });
});

describe('serving', () => {
  test('only Questions from the chosen Domain are served', async () => {
    const { engine } = await engineFor(fixtureBank({ verbal: ['v1', 'v2'], quantitative: ['q1', 'q2'] }));
    engine.start('quantitative');

    const served = [engine.current().question.id];
    for (let i = 0; i < 5; i++) {
      await engine.respond(CORRECT);
      engine.next();
      served.push(engine.current().question.id);
    }

    expect(served.every((id) => id.startsWith('q'))).toBe(true);
  });

  test('Next serves a different Question', async () => {
    const { engine } = await engineFor(fixtureBank({ verbal: ['v1', 'v2', 'v3'] }));
    engine.start('verbal');
    const first = engine.current().question.id;
    await engine.respond(CORRECT);
    engine.next();

    expect(engine.current().question.id).not.toBe(first);
  });

  test('Next waits for a Response', async () => {
    const { engine } = await engineFor(fixtureBank({ verbal: ['v1', 'v2'] }));
    engine.start('verbal');

    expect(() => engine.next()).toThrow();
  });
});
