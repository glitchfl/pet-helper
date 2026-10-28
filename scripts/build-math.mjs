// typesets every math segment of the question bank with mathjax and writes bank/<exam>/math.json,
// which the app draws as native svg - rerun after adding an exam or editing its math: npm run build:math
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mathOf } from '../src/bank/rich-text.ts';

const require = createRequire(import.meta.url);
const { mathjax } = require('mathjax-full/js/mathjax.js');
const { TeX } = require('mathjax-full/js/input/tex.js');
const { SVG } = require('mathjax-full/js/output/svg.js');
const { liteAdaptor } = require('mathjax-full/js/adaptors/liteAdaptor.js');
const { RegisterHTMLHandler } = require('mathjax-full/js/handlers/html.js');
require('mathjax-full/js/input/tex/base/BaseConfiguration.js');
require('mathjax-full/js/input/tex/ams/AmsConfiguration.js');

const BANK = fileURLToPath(new URL('../bank/', import.meta.url));
const HEBREW = /\p{Script=Hebrew}/u;

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const tex = new TeX({
  packages: ['base', 'ams'],
  formatError: (_jax, error) => {
    throw error;
  },
});
const document = mathjax.document('', { InputJax: tex, OutputJax: new SVG({ fontCache: 'none' }) });

function richTextsOf(exam) {
  const texts = [];
  for (const section of exam.sections) {
    for (const question of section.questions) {
      texts.push([question.id, question.stem]);
      for (const option of question.options) if ('text' in option) texts.push([question.id, option.text]);
    }
  }
  for (const questionSet of exam.questionSets) {
    if (questionSet.kind === 'chart' && questionSet.intro) texts.push([questionSet.id, questionSet.intro]);
  }
  return texts;
}

const round = (value) => Math.round(value) / 1000;

// glyph outlines repeat across formulas, so each distinct path is stored once and referenced as d="@index"
function typeset(latex, glyphs) {
  const svg = adaptor.innerHTML(document.convert(`\\displaystyle ${latex}`, { display: false }));
  const [, minY, width, height] = svg.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);

  const body = svg
    .replace(/^<svg[^>]*>/, '')
    .replace(/<\/svg>$/, '')
    .replace(/ data-(mml-node|c)="[^"]*"/g, '')
    .replace(/ d="([^"]{40,})"/g, (_, path) => {
      if (!glyphs.has(path)) glyphs.set(path, glyphs.size);
      return ` d="@${glyphs.get(path)}"`;
    })
    .replace(/><\/(path|rect)>/g, '/>');

  return {
    w: round(width),
    a: round(-minY),
    d: round(height + minY),
    svg: `<svg viewBox="0 ${minY} ${width} ${height}">${body}</svg>`,
  };
}

let total = 0;
for (const folder of readdirSync(BANK, { withFileTypes: true }).filter((entry) => entry.isDirectory())) {
  const exam = JSON.parse(readFileSync(join(BANK, folder.name, 'exam.json'), 'utf8'));
  const latexes = new Set();
  for (const [owner, text] of richTextsOf(exam)) {
    for (const latex of mathOf(text)) {
      if (HEBREW.test(latex)) throw new Error(`${owner}: hebrew inside math must be a top-level \\frac of \\text phrases - "${latex}"`);
      latexes.add(latex);
    }
  }

  const glyphs = new Map();
  const math = {};
  for (const latex of [...latexes].sort()) {
    try {
      math[latex] = typeset(latex, glyphs);
    } catch (error) {
      throw new Error(`${exam.id}: cannot typeset "${latex}" - ${error.message}`);
    }
  }

  const file = join(BANK, folder.name, 'math.json');
  writeFileSync(file, `${JSON.stringify({ glyphs: [...glyphs.keys()], math }, null, 1)}\n`);
  total += latexes.size;
  console.log(`${exam.id}: ${latexes.size} formulas, ${glyphs.size} glyphs`);
}
console.log(`typeset ${total} formulas`);
