"""Turns one NITE Exam PDF into a Question Bank folder under bank/.

    inspect  re-check the template facts (Sections, Question counts, Answer Key) before trusting them
    verbal   write the Verbal Sections into bank/<exam>/exam.json
    quant    write a Quantitative draft whose stems and Options still need retyping as LaTeX
    pages    render pages with a grid in points, for reading off crop rectangles
    crop     cut the Figures, Charts, image Options and Formula Sheet listed in crops/<exam>.json
    proof    build the Proof Sheet that shows each Question next to its crop from the PDF

Run with the repo's venv: .venv/bin/python scripts/extract/extract.py inspect exam.pdf
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import pymupdf

from proof import write_proof
from structure import Section, join_lines, parse_answer_key, parse_sections, passage_text

ROOT = Path(__file__).resolve().parents[2]
CROPS = Path(__file__).resolve().parent / 'crops'
EXPECTED_COUNT = {'verbal': 23, 'quantitative': 20}
SEASONS = ('spring', 'summer', 'autumn', 'winter')
EXAM_KEYS = ('id', 'season', 'year', 'sample', 'formulaSheet', 'sections', 'questionSets')
CROP_DPI = 288
# the watermark behind every page is a pale grey (250) - whiter than any real fill in a Figure
WATERMARK_GREY = 240


def exam_dir(exam_id: str) -> Path:
    return ROOT / 'bank' / exam_id


def load_exam(exam_id: str) -> dict:
    path = exam_dir(exam_id) / 'exam.json'
    if path.exists():
        return json.loads(path.read_text('utf8'))
    season, year = exam_id.rsplit('-', 1)
    if season not in SEASONS or not year.isdigit():
        raise SystemExit(f'an Exam id is <season>-<year>, e.g. autumn-2026 - got {exam_id}')
    return {'id': exam_id, 'season': season, 'year': int(year), 'sections': [], 'questionSets': []}


def save_exam(exam: dict) -> None:
    path = exam_dir(exam['id']) / 'exam.json'
    path.parent.mkdir(parents=True, exist_ok=True)
    exam['sections'].sort(key=lambda section: section['number'])
    path.write_text(json.dumps(exam, ensure_ascii=False, indent=2) + '\n', 'utf8')
    print(f'wrote {path.relative_to(ROOT)}')


def load_crops(exam_id: str) -> dict:
    path = CROPS / f'{exam_id}.json'
    return json.loads(path.read_text('utf8')) if path.exists() else {}


def escape_dollars(text: str) -> str:
    return text.replace('$', '\\$')


def inspect(doc: pymupdf.Document, sections: list[Section]) -> int:
    problems = []
    for section in sections:
        numbers = [question.number for question in section.questions]
        expected = EXPECTED_COUNT[section.domain]
        print(
            f'Section {section.number}: {section.domain} {section.ordinal}, PDF pages '
            f'{section.pages[0] + 1}-{section.pages[-1] + 1}, says {section.stated_count} Questions, found {len(numbers)}'
        )
        if section.formula_sheet_page is not None:
            print(f'  Formula Sheet on PDF page {section.formula_sheet_page + 1}')
        for question_set in section.sets:
            members = [question.number for question in section.questions if question.set_index == section.sets.index(question_set)]
            print(f'  {question_set.kind} on PDF page {question_set.page + 1}, Questions {members}')
            if question_set.kind == 'passage':
                misplaced = {n: at for n, at in question_set.line_markers.items() if n != at}
                print(f'    {len(question_set.lines)} lines, markers {sorted(question_set.line_markers)}')
                if misplaced:
                    problems.append(f'Section {section.number} passage: line markers on the wrong lines {misplaced}')
        types = sorted({question.question_type for question in section.questions})
        print(f'  Question Types: {types}')
        if numbers != list(range(1, expected + 1)) or section.stated_count != expected:
            problems.append(f'Section {section.number}: expected Questions 1-{expected}, found {numbers}')
        if section.domain == 'quantitative' and section.formula_sheet_page is None:
            problems.append(f'Section {section.number}: no Formula Sheet page')
        for question in section.questions:
            if sorted(question.option_markers) != [1, 2, 3, 4]:
                problems.append(f'Section {section.number} Question {question.number}: found Option markers {sorted(question.option_markers)}')

    key = parse_answer_key(doc)
    print(f'Answer Key on PDF page {key.page + 1}: ' + ', '.join(f'{d} {p}: {len(t)}' for (d, p), t in key.tables.items()))
    for section in sections:
        table = key.tables.get((section.domain, section.ordinal), {})
        if sorted(table) != [question.number for question in section.questions]:
            problems.append(f'Section {section.number}: Answer Key covers {sorted(table)}')

    for problem in problems:
        print('PROBLEM', problem)
    return 1 if problems else 0


def question_id(exam_id: str, section: Section, number: int) -> str:
    return f'{exam_id}-s{section.number}-q{number}'


def section_json(exam_id: str, section: Section, key: dict[int, int], crops: dict) -> tuple[dict, list[dict]]:
    sets = []
    set_ids = {}
    for index, question_set in enumerate(section.sets):
        set_id = f'{exam_id}-s{section.number}-{question_set.kind}{index + 1}'
        set_ids[index] = set_id
        members = [question for question in section.questions if question.set_index == index]
        entry: dict = {'id': set_id, 'kind': question_set.kind, 'questionIds': []}
        if question_set.kind == 'passage':
            text, markers = passage_text(question_set)
            # passages render as plain text - escaping a $ here would shift every later line marker
            entry |= {'text': text, 'lineMarkers': markers}
        else:
            entry |= {'image': f'images/s{section.number}-chart{index + 1}.png', 'intro': join_lines(question_set.lines)}
        entry['questionIds'] = [question_id(exam_id, section, question.number) for question in members]
        sets.append(entry)

    questions = []
    for question in section.questions:
        prefix = f's{section.number}-q{question.number}'
        entry: dict = {
            'id': question_id(exam_id, section, question.number),
            'number': question.number,
            'questionType': question.question_type,
        }
        if section.domain == 'quantitative':
            entry['topic'] = ''
        entry['stem'] = escape_dollars(join_lines(question.stem))
        entry['options'] = [
            {'image': f'images/{prefix}-option{n}.png'}
            if f'{prefix}-option{n}.png' in crops
            else {'text': escape_dollars(join_lines(question.options.get(n, [])))}
            for n in range(1, 5)
        ]
        entry['correctOption'] = key[question.number]
        if f'{prefix}-figure.png' in crops:
            entry['figure'] = f'images/{prefix}-figure.png'
        if question.set_index is not None:
            entry['questionSetId'] = set_ids[question.set_index]
        questions.append(entry)
    return {'number': section.number, 'domain': section.domain, 'questions': questions}, sets


def write_domain(doc: pymupdf.Document, sections: list[Section], exam_id: str, domain: str, force: bool) -> None:
    exam = load_exam(exam_id)
    if any(section['domain'] == domain for section in exam['sections']) and not force:
        raise SystemExit(
            f'{exam_id} already has {domain} Sections - they may hold fixes made by hand. Pass --force to overwrite them'
        )
    crops = load_crops(exam_id)
    key = parse_answer_key(doc)
    replaced = {section['number'] for section in exam['sections'] if section['domain'] == domain}
    exam['sections'] = [section for section in exam['sections'] if section['domain'] != domain]
    exam['questionSets'] = [
        question_set
        for question_set in exam['questionSets']
        if not any(question_set['id'].startswith(f'{exam_id}-s{number}-') for number in replaced)
    ]
    for section in sections:
        if section.domain != domain:
            continue
        table = key.tables.get((section.domain, section.ordinal), {})
        if sorted(table) != [question.number for question in section.questions]:
            raise SystemExit(f'Section {section.number}: the Answer Key covers {sorted(table)} - run inspect')
        section_entry, sets = section_json(exam_id, section, table, crops)
        exam['sections'].append(section_entry)
        exam['questionSets'].extend(sets)
    if domain == 'quantitative' and 'formula-sheet.png' in crops:
        exam['formulaSheet'] = 'images/formula-sheet.png'
    save_exam(dict(sorted(exam.items(), key=lambda item: EXAM_KEYS.index(item[0]))))


def crop(doc: pymupdf.Document, exam_id: str) -> None:
    crops = load_crops(exam_id)
    if not crops:
        raise SystemExit(f'nothing to crop - list the rectangles in {(CROPS / f"{exam_id}.json").relative_to(ROOT)}')
    images = exam_dir(exam_id) / 'images'
    images.mkdir(parents=True, exist_ok=True)
    whiten = bytes(255 if value >= WATERMARK_GREY else value for value in range(256))
    for name, spec in crops.items():
        page = doc[spec['page'] - 1]
        for blank in spec.get('blank', []):
            page.draw_rect(pymupdf.Rect(blank), color=None, fill=(1, 1, 1), overlay=True)
        pixmap = page.get_pixmap(dpi=CROP_DPI, clip=pymupdf.Rect(spec['rect']), colorspace=pymupdf.csGRAY)
        clean = pymupdf.Pixmap(pymupdf.csGRAY, pixmap.width, pixmap.height, pixmap.samples.translate(whiten), False)
        clean.save(images / name)
        print(f'cropped {name} ({clean.width}x{clean.height})')


def render_pages(doc: pymupdf.Document, exam_id: str, pages: list[int]) -> None:
    out = ROOT / 'proof' / exam_id / 'pages'
    out.mkdir(parents=True, exist_ok=True)
    for number in pages:
        page = doc[number - 1]
        shape = page.new_shape()
        for x in range(0, int(page.rect.width), 10):
            shape.draw_line((x, 0), (x, page.rect.height))
        shape.finish(color=(1, 0.6, 0.6), width=0.2)
        for y in range(0, int(page.rect.height), 10):
            shape.draw_line((0, y), (page.rect.width, y))
        shape.finish(color=(0.6, 0.6, 1), width=0.2)
        for x in range(0, int(page.rect.width), 50):
            shape.insert_text((x + 1, 8), str(x), fontsize=5, color=(1, 0, 0))
        for y in range(0, int(page.rect.height), 50):
            shape.insert_text((1, y - 1), str(y), fontsize=5, color=(0, 0, 1))
        shape.commit()
        path = out / f'page-{number}.png'
        page.get_pixmap(dpi=150).save(path)
        print(f'rendered {path.relative_to(ROOT)}')


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('command', choices=['inspect', 'verbal', 'quant', 'pages', 'crop', 'proof'])
    parser.add_argument('pdf', type=Path)
    parser.add_argument('--exam', help='the Exam id, <season>-<year>, e.g. autumn-2026')
    parser.add_argument('--force', action='store_true', help='overwrite Sections that already exist')
    parser.add_argument('--pages', type=int, nargs='+', help='PDF page numbers for the pages command')
    args = parser.parse_args(argv)
    if args.command != 'inspect' and not args.exam:
        parser.error('--exam is required')

    doc = pymupdf.open(args.pdf)
    if args.command in ('pages', 'crop'):
        if args.command == 'pages':
            render_pages(doc, args.exam, args.pages or [])
        else:
            crop(doc, args.exam)
        return 0

    sections = parse_sections(doc)
    if args.command == 'inspect':
        return inspect(doc, sections)
    if args.command == 'verbal':
        write_domain(doc, sections, args.exam, 'verbal', args.force)
    elif args.command == 'quant':
        write_domain(doc, sections, args.exam, 'quantitative', args.force)
    else:
        write_proof(doc, sections, load_exam(args.exam), ROOT / 'proof' / args.exam, ROOT)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
