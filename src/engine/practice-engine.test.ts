import { createPracticeEngine, type PracticeEngine } from './practice-engine';
import { createMemoryResponseStore, type Response } from './response-store';
import { CORRECT, WRONG, chart, fakeClock, fixtureBank, passage, seededRandom, typed } from './test-bank';
import type { Exam, OptionNumber } from '@/bank/types';

function saved(questionId: string, correct: boolean, answeredAt = 0): Response {
  return { questionId, option: correct ? CORRECT : WRONG, correct, answeredAt, durationMs: 1_000 };
}

async function engineFor(bank: Exam[], options: { random?: () => number; responses?: Response[] } = {}) {
  const store = createMemoryResponseStore(options.responses);
  const clock = fakeClock();
  const engine = await createPracticeEngine({
    bank,
    store,
    clock: clock.now,
    random: options.random ?? seededRandom(1),
  });
  return { engine, store, clock };
}

async function answerServed(engine: PracticeEngine, count: number, option: OptionNumber = CORRECT) {
  const ids: string[] = [];
  for (let i = 0; i < count; i++) {
    if (i > 0) engine.next();
    ids.push(engine.current().question.id);
    await engine.respond(option);
  }
  return ids;
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

  test('a Response records the Option, its correctness, when it was answered and how long it took', async () => {
    const { engine, store, clock } = await engineFor(fixtureBank({ verbal: ['v1', 'v2'] }));
    engine.start('verbal');
    const first = engine.current().question.id;
    clock.advance(4_000);
    await engine.respond(WRONG);
    clock.advance(30_000);
    engine.next();
    const second = engine.current().question.id;
    clock.advance(12_500);
    await engine.respond(CORRECT);

    expect(await store.readAll()).toEqual([
      { questionId: first, option: WRONG, correct: false, answeredAt: 1_004_000, durationMs: 4_000 },
      { questionId: second, option: CORRECT, correct: true, answeredAt: 1_046_500, durationMs: 12_500 },
    ]);
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

  test('Unseen Questions are served first, even when practice is reopened', async () => {
    const { engine } = await engineFor(fixtureBank({ verbal: ['v1', 'v2', 'v3', 'v4'] }), {
      responses: [saved('v1', true), saved('v2', false)],
    });
    engine.start('verbal');

    expect(await answerServed(engine, 2)).toEqual(expect.arrayContaining(['v3', 'v4']));
  });

  test('Mistakes are served once nothing is Unseen, before the rest', async () => {
    const { engine } = await engineFor(fixtureBank({ verbal: ['v1', 'v2', 'v3', 'v4'] }), {
      responses: [saved('v1', true), saved('v2', false), saved('v3', true), saved('v4', false)],
    });
    engine.start('verbal');

    expect(await answerServed(engine, 2)).toEqual(expect.arrayContaining(['v2', 'v4']));
  });

  test('only the most recent Response decides whether a Question is a Mistake', async () => {
    const { engine } = await engineFor(fixtureBank({ verbal: ['v1', 'v2', 'v3'] }), {
      responses: [saved('v1', false, 1), saved('v2', true, 2), saved('v3', true, 3), saved('v1', true, 4), saved('v3', false, 5)],
    });
    engine.start('verbal');

    expect(engine.current().question.id).toBe('v3');
  });

  test('a Mistake answered correctly stops being served before the rest', async () => {
    const bank = fixtureBank({ verbal: ['v1', 'v2', 'v3'] });
    const first = await engineFor(bank, {
      random: () => 0,
      responses: [saved('v1', false), saved('v2', false), saved('v3', true)],
    });
    first.engine.start('verbal');
    const cleared = first.engine.current().question.id;
    await first.engine.respond(CORRECT);

    const reopened = await createPracticeEngine({
      bank,
      store: first.store,
      clock: fakeClock().now,
      random: () => 0,
    });
    reopened.start('verbal');

    expect(reopened.current().question.id).not.toBe(cleared);
  });

  test('practice keeps going after every Question is answered correctly', async () => {
    const { engine } = await engineFor(fixtureBank({ verbal: ['v1', 'v2'] }), {
      responses: [saved('v1', true), saved('v2', true)],
    });
    engine.start('verbal');

    expect(await answerServed(engine, 6)).toHaveLength(6);
  });

  test('the same Question is never served twice in a row while others exist', async () => {
    const { engine } = await engineFor(fixtureBank({ verbal: ['v1', 'v2', 'v3'] }));
    engine.start('verbal');

    const served = await answerServed(engine, 30);

    expect(served.some((id, i) => id === served[i - 1])).toBe(false);
  });

  test('the only Question in a Domain is served again', async () => {
    const { engine } = await engineFor(fixtureBank({ verbal: ['v1'] }));
    engine.start('verbal');

    expect(await answerServed(engine, 3)).toEqual(['v1', 'v1', 'v1']);
  });

  test('the order within a tier comes from the injected randomness', async () => {
    const bank = fixtureBank({ verbal: ['v1', 'v2', 'v3', 'v4', 'v5'] });
    const low = await engineFor(bank, { random: () => 0 });
    const high = await engineFor(bank, { random: () => 0.999 });
    low.engine.start('verbal');
    high.engine.start('verbal');

    expect(low.engine.current().question.id).not.toBe(high.engine.current().question.id);
  });

  test('a skipped Question records nothing and stays Unseen', async () => {
    const { engine, store } = await engineFor(fixtureBank({ verbal: ['v1', 'v2', 'v3'] }), {
      responses: [saved('v1', true), saved('v2', true)],
    });
    engine.start('verbal');
    engine.skip();
    await engine.respond(CORRECT);
    engine.next();

    expect(engine.current().question.id).toBe('v3');
    expect((await store.readAll()).filter((response) => response.questionId === 'v3')).toEqual([]);
  });

  test('Next waits for a Response', async () => {
    const { engine } = await engineFor(fixtureBank({ verbal: ['v1', 'v2'] }));
    engine.start('verbal');

    expect(() => engine.next()).toThrow();
  });
});

describe('progress', () => {
  test('nothing is seen before the first Response', async () => {
    const { engine } = await engineFor(fixtureBank({ verbal: ['v1', 'v2'], quantitative: ['q1'] }));

    expect(engine.progress('verbal')).toEqual({ total: 2, seen: 0, percentCorrect: null, mistakes: 0 });
  });

  test('counts seen Questions, percentage correct by most recent Response, and Mistakes', async () => {
    const { engine } = await engineFor(fixtureBank({ verbal: ['v1', 'v2', 'v3', 'v4', 'v5'], quantitative: ['q1'] }), {
      responses: [saved('v1', false, 1), saved('v2', false, 2), saved('v3', true, 3), saved('v1', true, 4), saved('q1', false, 5)],
    });

    expect(engine.progress('verbal')).toEqual({ total: 5, seen: 3, percentCorrect: 67, mistakes: 1 });
  });

  test('a skipped Question does not count as seen', async () => {
    const { engine } = await engineFor(fixtureBank({ verbal: ['v1', 'v2'] }), { responses: [saved('v1', true)] });
    engine.start('verbal');
    engine.skip();

    expect(engine.progress('verbal')).toMatchObject({ seen: 1, percentCorrect: 100 });
  });

  test('a new Response shows up in the progress at once', async () => {
    const { engine } = await engineFor(fixtureBank({ quantitative: ['q1', 'q2'] }));
    engine.start('quantitative');
    await engine.respond(WRONG);

    expect(engine.progress('quantitative')).toEqual({ total: 2, seen: 1, percentCorrect: 0, mistakes: 1 });
  });
});

describe('Question Sets', () => {
  test('a Passage and all its Questions are served as one block, in printed order', async () => {
    const { engine } = await engineFor(fixtureBank({ verbal: ['v1', passage('p1', ['v2', 'v3', 'v4'])] }));
    engine.start('verbal');

    const served = (await answerServed(engine, 8)).join(' ');

    expect(['v1 v2 v3 v4 v1 v2 v3 v4', 'v2 v3 v4 v1 v2 v3 v4 v1']).toContain(served);
  });

  test('a Chart and all its Questions are served as one block, in printed order', async () => {
    const { engine } = await engineFor(fixtureBank({ quantitative: [chart('c1', ['q1', 'q2', 'q3']), 'q4'] }));
    engine.start('quantitative');

    const served = (await answerServed(engine, 8)).join(' ');

    expect(['q1 q2 q3 q4 q1 q2 q3 q4', 'q4 q1 q2 q3 q4 q1 q2 q3']).toContain(served);
  });

  test('each Question in a Chart Set comes with its Chart', async () => {
    const { engine } = await engineFor(fixtureBank({ quantitative: [chart('c1', ['q1', 'q2'])] }));
    engine.start('quantitative');

    expect(engine.current().questionSet).toMatchObject({ id: 'c1', kind: 'chart', image: 'chart.png' });
  });

  test('each Question in a Set comes with its Passage', async () => {
    const { engine } = await engineFor(fixtureBank({ verbal: [passage('p1', ['v1', 'v2'])] }));
    engine.start('verbal');
    const first = engine.current().questionSet?.id;
    await engine.respond(CORRECT);
    engine.next();

    expect([first, engine.current().questionSet?.id]).toEqual(['p1', 'p1']);
  });

  test('a standalone Question comes without a Question Set', async () => {
    const { engine } = await engineFor(fixtureBank({ verbal: ['v1'] }));
    engine.start('verbal');

    expect(engine.current().questionSet).toBeUndefined();
  });

  test('a partly answered Set counts as Unseen and is served whole', async () => {
    const { engine } = await engineFor(fixtureBank({ verbal: ['v1', passage('p1', ['v2', 'v3', 'v4'])] }), {
      responses: [saved('v1', true), saved('v2', true), saved('v3', false)],
    });
    engine.start('verbal');

    expect(await answerServed(engine, 3)).toEqual(['v2', 'v3', 'v4']);
  });

  test('a Set holding a Mistake is served before Sets and Questions that have none', async () => {
    const { engine } = await engineFor(fixtureBank({ verbal: ['v1', passage('p1', ['v2', 'v3']), 'v4'] }), {
      responses: [saved('v1', true), saved('v2', true), saved('v3', false), saved('v4', true)],
    });
    engine.start('verbal');

    expect(engine.current().question.id).toBe('v2');
  });

  test('skipping a Question in a Set moves to the next Question of the Set', async () => {
    const { engine, store } = await engineFor(fixtureBank({ verbal: [passage('p1', ['v1', 'v2', 'v3'])] }));
    engine.start('verbal');
    engine.skip();

    expect(engine.current().question.id).toBe('v2');
    expect(await store.readAll()).toEqual([]);
  });
});

describe('Targeted Drill', () => {
  const analogy = (id: string) => typed(id, 'אנלוגיות');
  const comprehension = (id: string) => typed(id, 'שאלות הבנה והסקה');
  const reading = (id: string) => typed(id, 'קטע קריאה');
  const geometry = (id: string) => typed(id, 'שאלות ובעיות', 'גאומטריה');
  const algebra = (id: string) => typed(id, 'שאלות ובעיות', 'אלגברה');
  const chartInference = (id: string) => typed(id, 'הסקה מתרשים', 'ניתוח נתונים');

  test('only Questions of the picked Question Type are served', async () => {
    const { engine } = await engineFor(
      fixtureBank({ verbal: [analogy('a1'), analogy('a2'), comprehension('c1'), comprehension('c2')] }),
    );
    engine.start('verbal', [{ questionType: 'אנלוגיות' }]);

    expect(new Set(await answerServed(engine, 6))).toEqual(new Set(['a1', 'a2']));
  });

  test('a Topic narrows its Question Type to the Questions on that Topic', async () => {
    const { engine } = await engineFor(fixtureBank({ quantitative: [geometry('g1'), algebra('x1'), geometry('g2')] }));
    engine.start('quantitative', [{ questionType: 'שאלות ובעיות', topic: 'גאומטריה' }]);

    expect(new Set(await answerServed(engine, 6))).toEqual(new Set(['g1', 'g2']));
  });

  test('Questions from every picked Focus are served together', async () => {
    const { engine } = await engineFor(
      fixtureBank({ quantitative: [geometry('g1'), algebra('x1'), chart('ch', [chartInference('t1'), chartInference('t2')])] }),
    );
    engine.start('quantitative', [{ questionType: 'שאלות ובעיות', topic: 'גאומטריה' }, { questionType: 'הסקה מתרשים' }]);

    expect(new Set(await answerServed(engine, 9))).toEqual(new Set(['g1', 't1', 't2']));
  });

  test('Unseen Questions in the Focus come first, then its Mistakes', async () => {
    const { engine } = await engineFor(
      fixtureBank({ verbal: [analogy('a1'), analogy('a2'), analogy('a3'), comprehension('c1')] }),
      { responses: [saved('a1', true), saved('a2', false)] },
    );
    engine.start('verbal', [{ questionType: 'אנלוגיות' }]);

    expect(await answerServed(engine, 2)).toEqual(['a3', 'a2']);
  });

  test('a Question Set keeps only its Questions in the Focus, still with its Passage', async () => {
    const { engine } = await engineFor(
      fixtureBank({ verbal: [passage('p1', [reading('v1'), analogy('v2'), reading('v3')])] }),
    );
    engine.start('verbal', [{ questionType: 'קטע קריאה' }]);

    expect(engine.current().questionSet?.id).toBe('p1');
    expect(await answerServed(engine, 4)).toEqual(['v1', 'v3', 'v1', 'v3']);
  });

  test('progress can be narrowed to a Focus', async () => {
    const { engine } = await engineFor(
      fixtureBank({ verbal: [analogy('a1'), analogy('a2'), comprehension('c1')] }),
      { responses: [saved('a1', false), saved('c1', true)] },
    );

    expect(engine.progress('verbal', [{ questionType: 'אנלוגיות' }])).toEqual({
      total: 2,
      seen: 1,
      percentCorrect: 0,
      mistakes: 1,
    });
  });

  test('a Question Type is offered whole, or as its Topics when it spans several', async () => {
    const { engine } = await engineFor(
      fixtureBank({
        quantitative: [algebra('x1'), geometry('g1'), geometry('g2'), chart('ch', [chartInference('t1'), chartInference('t2')])],
      }),
    );

    expect(engine.focuses('quantitative')).toEqual([
      { questionType: 'שאלות ובעיות', topic: 'גאומטריה' },
      { questionType: 'שאלות ובעיות', topic: 'אלגברה' },
      { questionType: 'הסקה מתרשים' },
    ]);
  });

  test('only the Domain\'s Question Types are offered, the biggest first', async () => {
    const { engine } = await engineFor(
      fixtureBank({
        verbal: [analogy('a1'), comprehension('c1'), comprehension('c2'), passage('p1', [reading('r1'), reading('r2'), reading('r3')])],
        quantitative: [geometry('g1')],
      }),
    );

    expect(engine.focuses('verbal')).toEqual([
      { questionType: 'קטע קריאה' },
      { questionType: 'שאלות הבנה והסקה' },
      { questionType: 'אנלוגיות' },
    ]);
  });
});
