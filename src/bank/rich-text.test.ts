import { mathOf, parseParagraphs, parseRichText } from './rich-text';

test('\\$ is a literal dollar sign and a lone $ toggles math', () => {
  expect(parseRichText('עלה \\$5 ועוד $x$')).toEqual([
    { kind: 'text', text: 'עלה $5 ועוד ' },
    { kind: 'math', latex: 'x' },
  ]);
});

test('a line that holds only one formula is display math', () => {
  expect(parseParagraphs('נתון:\n $x = ?$ ')).toEqual([
    { kind: 'text', segments: [{ kind: 'text', text: 'נתון:' }] },
    { kind: 'math', latex: 'x = ?' },
  ]);
});

test('a line that mixes words and formulas keeps its formulas inline', () => {
  expect(parseParagraphs('$a$ ו-$b$ מקבילים')).toEqual([
    {
      kind: 'text',
      segments: [
        { kind: 'math', latex: 'a' },
        { kind: 'text', text: ' ו-' },
        { kind: 'math', latex: 'b' },
        { kind: 'text', text: ' מקבילים' },
      ],
    },
  ]);
});

test('a fraction of hebrew phrases is laid out natively, with the formula that follows it', () => {
  expect(parseParagraphs('$\\frac{\\text{שטח הריבוע } ADEF}{\\text{שטח המשולש}} = ?$')).toEqual([
    {
      kind: 'wordFraction',
      lead: '',
      numerator: [
        { kind: 'text', text: 'שטח הריבוע ' },
        { kind: 'math', latex: 'ADEF' },
      ],
      denominator: [{ kind: 'text', text: 'שטח המשולש' }],
      rest: '= ?',
    },
  ]);
});

test('a fraction of phrases may follow a label', () => {
  const [paragraph] = parseParagraphs('נתון: $\\frac{\\text{א}}{\\text{ב}} = \\frac{5}{9}$');
  expect(paragraph).toMatchObject({ kind: 'wordFraction', lead: 'נתון:', rest: '= \\frac{5}{9}' });
});

test('mathOf lists every formula the app has to draw, including the parts of a word fraction', () => {
  expect(mathOf('אם $x^2 = 9$ אז\n$\\frac{\\text{שטח } ABC}{\\text{היקף}} = ?$\n$y$')).toEqual(['x^2 = 9', 'ABC', '= ?', 'y']);
});
