from __future__ import annotations

import html
import os
from pathlib import Path

import pymupdf

from layout import CONTENT_BOTTOM
from structure import Section, band

PROOF_DPI = 144
DOMAIN_NAMES = {'verbal': 'חשיבה מילולית', 'quantitative': 'חשיבה כמותית'}


def _rich(value: str) -> str:
    # rendered in the browser with the same $ rules as src/bank/rich-text.ts
    return f'<div class="rich" data-rich="{html.escape(value)}"></div>'


def _passage(question_set: dict) -> str:
    text = question_set['text']
    pieces = []
    cursor = len(text)
    for marker in sorted(question_set['lineMarkers'], key=lambda marker: -marker['offset']):
        pieces.append(html.escape(text[marker['offset'] : cursor]))
        pieces.append(f'<sup class="marker">{marker["line"]}</sup>')
        cursor = marker['offset']
    pieces.append(html.escape(text[:cursor]))
    return '<div class="passage">' + ''.join(reversed(pieces)).replace('\n', '<br>') + '</div>'


def _crop(doc: pymupdf.Document, page: int, rect: pymupdf.Rect, path: Path) -> None:
    doc[page].get_pixmap(dpi=PROOF_DPI, clip=rect, colorspace=pymupdf.csGRAY).save(path)


def write_proof(doc: pymupdf.Document, sections: list[Section], exam: dict, out_dir: Path, root: Path) -> None:
    crops = out_dir / 'crops'
    crops.mkdir(parents=True, exist_ok=True)
    bank = os.path.relpath(root / 'bank' / exam['id'], out_dir)
    katex = os.path.relpath(root / 'node_modules' / 'katex' / 'dist', out_dir)
    parsed = {section.number: section for section in sections}
    sets = {question_set['id']: question_set for question_set in exam['questionSets']}

    def image(path: str) -> str:
        return f'<img class="bank" src="{html.escape(bank)}/{html.escape(path)}">'

    body = []
    if exam.get('formulaSheet'):
        body.append(f'<h2>דף נוסחאות</h2><div class="row"><div class="app">{image(exam["formulaSheet"])}</div></div>')

    for section in exam['sections']:
        source = parsed[section['number']]
        questions = {question.number: question for question in source.questions}
        body.append(f'<h2>פרק {section["number"]} · {DOMAIN_NAMES[section["domain"]]} · {source.ordinal}</h2>')
        for question in section['questions']:
            found = questions[question['number']]
            question_set = sets.get(question.get('questionSetId', ''))
            if question_set and question_set['questionIds'][0] == question['id'] and found.set_index is not None:
                block = source.sets[found.set_index]
                bottom = found.top if found.page == block.page else CONTENT_BOTTOM
                name = f's{section["number"]}-{question_set["kind"]}.png'
                _crop(doc, block.page, band(block.top - 4, bottom), crops / name)
                app = (
                    _passage(question_set)
                    if question_set['kind'] == 'passage'
                    else _rich(question_set.get('text', '')) + image(question_set['image'])
                )
                body.append(f'<div class="row set"><div class="app">{app}</div><img class="pdf" src="crops/{name}"></div>')

            name = f's{section["number"]}-q{question["number"]}.png'
            _crop(doc, found.page, found.region, crops / name)
            meta = ' · '.join(
                part for part in [f'שאלה {question["number"]}', question['questionType'], question.get('topic', '')] if part
            )
            options = []
            for index, option in enumerate(question['options'], 1):
                content = image(option['image']) if 'image' in option else _rich(option['text'])
                correct = ' correct' if index == question['correctOption'] else ''
                options.append(f'<li class="option{correct}"><span class="mark">({index})</span>{content}</li>')
            figure = image(question['figure']) if question.get('figure') else ''
            body.append(
                f'<div class="row" id="{html.escape(question["id"])}"><div class="app">'
                f'<div class="meta">{html.escape(meta)}</div>{_rich(question["stem"])}{figure}'
                f'<ol class="options">{"".join(options)}</ol></div>'
                f'<img class="pdf" src="crops/{name}"></div>'
            )

    page = TEMPLATE.replace('{katex}', html.escape(katex)).replace('{title}', html.escape(exam['id']))
    (out_dir / 'index.html').write_text(page.replace('{body}', '\n'.join(body)), 'utf8')
    print(f'wrote {(out_dir / "index.html").relative_to(root)}')


TEMPLATE = """<!doctype html>
<html dir="rtl" lang="he">
<head>
<meta charset="utf-8">
<title>Proof Sheet · {title}</title>
<link rel="stylesheet" href="{katex}/katex.min.css">
<script src="{katex}/katex.min.js"></script>
<style>
body { font-family: -apple-system, system-ui, sans-serif; margin: 24px; background: #f4f4f4; color: #111; }
h1 { font-size: 22px; }
h2 { margin-top: 40px; border-bottom: 2px solid #999; }
.row { display: grid; grid-template-columns: minmax(300px, 420px) 1fr; gap: 24px; align-items: start;
  background: #fff; border: 1px solid #ccc; border-radius: 10px; padding: 16px; margin: 14px 0; }
.set { background: #eef3fb; }
.app { font-size: 17px; line-height: 1.6; }
.meta { color: #666; font-size: 14px; margin-bottom: 8px; }
.rich { white-space: normal; }
.passage { font-size: 16px; line-height: 1.8; }
.marker { color: #888; font-size: 11px; font-weight: 600; margin: 0 3px; }
.options { list-style: none; padding: 0; display: grid; gap: 6px; margin-top: 12px; }
.option { display: flex; gap: 8px; border: 1px solid #ccc; border-radius: 8px; padding: 6px 10px; }
.option.correct { border: 2px solid #1a7f37; background: #e8f6ec; }
.mark { color: #666; }
img.bank { max-width: 100%; background: #fff; border: 1px solid #ddd; border-radius: 6px; margin-top: 8px; }
img.pdf { max-width: 100%; border: 1px solid #ddd; }
.katex { direction: ltr; unicode-bidi: isolate; font-size: 1.12em; }
</style>
</head>
<body>
<h1>Proof Sheet · {title}</h1>
<p>Each Question as the app shows it, next to its crop from the PDF. The green Option is the Correct Option from the Answer Key.</p>
{body}
<script>
function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\\n/g, '<br>');
}
function render(value) {
  var out = '', buffer = '', inMath = false;
  function flush() {
    if (!buffer) return;
    out += inMath ? katex.renderToString('\\\\displaystyle ' + buffer, { throwOnError: false }) : escapeHtml(buffer);
    buffer = '';
  }
  for (var i = 0; i < value.length; i++) {
    if (value[i] === '\\\\' && value[i + 1] === '$') { buffer += inMath ? '\\\\$' : '$'; i++; }
    else if (value[i] === '$') { flush(); inMath = !inMath; }
    else buffer += value[i];
  }
  flush();
  return out;
}
document.querySelectorAll('[data-rich]').forEach(function (element) {
  element.innerHTML = render(element.getAttribute('data-rich'));
});
</script>
</body>
</html>
"""
