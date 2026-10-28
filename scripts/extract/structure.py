from __future__ import annotations

import re
from dataclasses import dataclass, field

import pymupdf

from layout import CONTENT_BOTTOM, CONTENT_LEFT, CONTENT_RIGHT, CONTENT_TOP, Line, page_lines

HEADER_BOTTOM = 45
QUESTION_NUMBER = re.compile(r'^(\d+)\.(?:\s|$)')
OPTION_MARKER = re.compile(r'^\(([1-4])\)(?:\s|$)')
LINE_MARKER = re.compile(r'^\((\d+)\)(?:\s|$)')
SECTION_HEADER = re.compile(r'חשיבה (מילולית|כמותית) - פרק (ראשון|שני)')
STATED_COUNT = re.compile(r'בפרק זה (\d+) שאלות')
DOMAINS = {'מילולית': 'verbal', 'כמותית': 'quantitative'}
SET_KINDS = {'קטע קריאה': 'passage', 'הסקה מתרשים': 'chart', 'הסקה מטבלה': 'chart'}
SET_QUESTIONS_HEADING = 'השאלות'
# some Exams split the reading into two short Passages, קטע א and קטע ב, under one קטעי קריאה heading
PASSAGE_PART = re.compile(r'^קטע [א-ת]$')

# question numbers and passage line markers share the right margin - option markers sit further in
MARGIN_X = 505
PARAGRAPH_GAP = 19.5
MARKER_GAP = 4.0


@dataclass
class TextLine:
    page: int
    baseline: float
    text: str


@dataclass
class Question:
    number: int
    question_type: str
    page: int
    top: float
    bottom: float
    stem: list[TextLine] = field(default_factory=list)
    options: dict[int, list[TextLine]] = field(default_factory=dict)
    option_markers: dict[int, pymupdf.Rect] = field(default_factory=dict)
    set_index: int | None = None

    @property
    def region(self) -> pymupdf.Rect:
        return band(self.top, self.bottom)


@dataclass
class QuestionSet:
    kind: str
    page: int
    top: float
    lines: list[TextLine] = field(default_factory=list)
    # printed line number -> how many passage lines down it sits
    line_markers: dict[int, int] = field(default_factory=dict)


@dataclass
class Section:
    number: int
    domain: str
    # ראשון or שני - which of the two Sections of its Domain the header names
    ordinal: str
    pages: list[int] = field(default_factory=list)
    stated_count: int | None = None
    formula_sheet_page: int | None = None
    questions: list[Question] = field(default_factory=list)
    sets: list[QuestionSet] = field(default_factory=list)


def _separators(page: pymupdf.Page) -> list[float]:
    return sorted(
        drawing['rect'].y0
        for drawing in page.get_drawings()
        if drawing['rect'].height < 1 and drawing['rect'].width > 400 and CONTENT_TOP < drawing['rect'].y0 < CONTENT_BOTTOM
    )


def band(top: float, bottom: float) -> pymupdf.Rect:
    return pymupdf.Rect(CONTENT_LEFT, top, CONTENT_RIGHT, bottom)


def _without_marker(pattern: re.Pattern, text: str) -> str:
    match = pattern.match(text)
    return text[match.end() :].strip() if match else text


def _rightmost(line: Line):
    return max(line.glyphs, key=lambda glyph: glyph.x1)


def _is_heading(line: Line) -> bool:
    glyph = _rightmost(line)
    return glyph.italic and glyph.bold and glyph.size >= 13.5


def _question_number(line: Line) -> int | None:
    glyph = _rightmost(line)
    match = QUESTION_NUMBER.match(line.text)
    if match and glyph.bold and glyph.size >= 13 and glyph.x1 > MARGIN_X:
        return int(match.group(1))
    return None


def _option_markers(line: Line) -> dict[int, pymupdf.Rect]:
    found = {}
    for chunk in line.chunks(gap=4.0):
        match = re.fullmatch(r'\(([1-4])\)', chunk.text)
        if match:
            found[int(match.group(1))] = pymupdf.Rect(chunk.x0, chunk.y0, chunk.x1, chunk.y1)
    return found


def _split_options(text: str) -> list[tuple[int, str]]:
    # side-by-side Options share a line like "(1) 2006 (2) 2007"
    parts = re.split(r'(?:^|\s)\(([1-4])\)(?:\s|$)', text)
    return [(int(parts[i]), parts[i + 1].strip()) for i in range(1, len(parts) - 1, 2)]


def parse_sections(doc: pymupdf.Document) -> list[Section]:
    sections: list[Section] = []
    for page_index in range(doc.page_count):
        header = ' '.join(line.text for line in page_lines(doc[page_index], top=0, bottom=HEADER_BOTTOM))
        match = SECTION_HEADER.search(header)
        if not match:
            continue
        domain, ordinal = DOMAINS[match.group(1)], match.group(2)
        if not sections or (sections[-1].domain, sections[-1].ordinal) != (domain, ordinal):
            sections.append(Section(len(sections) + 1, domain, ordinal))
        sections[-1].pages.append(page_index)

    for section in sections:
        _parse_section(doc, section)
    return sections


def _parse_section(doc: pymupdf.Document, section: Section) -> None:
    question_type = ''
    current: Question | None = None
    option: int | None = None
    open_set: QuestionSet | None = None
    set_questions = False

    for page_index in section.pages:
        # a Question never runs onto the next page - whatever follows on it is not part of the last one
        current, option = None, None
        page = doc[page_index]
        separators = _separators(page)
        lines = page_lines(page)
        page_text = ' '.join(line.text for line in lines)
        if 'נוסחאות' in page_text and 'הערות כלליות' in page_text:
            section.formula_sheet_page = page_index
        stated = STATED_COUNT.search(page_text)
        if stated and section.stated_count is None:
            section.stated_count = int(stated.group(1))

        previous_baseline = 0.0
        for line in lines:
            crossed = [y for y in separators if previous_baseline < y < line.baseline]
            previous_baseline = line.baseline
            if crossed and current:
                current.bottom = crossed[-1]
                current, option = None, None

            text = line.text
            as_text = TextLine(page_index, line.baseline, text)

            if _is_heading(line):
                name = re.sub(r'\s*\(שאלות[^)]*\)\s*$', '', text).strip()
                if name == SET_QUESTIONS_HEADING:
                    set_questions = True
                    continue
                if PASSAGE_PART.match(name):
                    name = 'קטע קריאה'
                question_type, set_questions, open_set = name, False, None
                if name in SET_KINDS:
                    open_set = QuestionSet(SET_KINDS[name], page_index, line.y0)
                    section.sets.append(open_set)
                continue

            number = _question_number(line)
            if number is not None:
                current = Question(number, question_type, page_index, line.y0 - 4, line.y1)
                if open_set and set_questions:
                    current.set_index = len(section.sets) - 1
                rest = _without_marker(QUESTION_NUMBER, text)
                if rest:
                    current.stem.append(TextLine(page_index, line.baseline, rest))
                option = None
                section.questions.append(current)
                continue

            if open_set and not set_questions:
                marker = LINE_MARKER.match(text)
                if marker and line.chunks(gap=4.0)[0].x0 > MARGIN_X:
                    open_set.line_markers[int(marker.group(1))] = len(open_set.lines) + 1
                    open_set.lines.append(TextLine(page_index, line.baseline, _without_marker(LINE_MARKER, text)))
                elif open_set.kind == 'chart' or open_set.line_markers:
                    open_set.lines.append(as_text)
                continue

            if not current:
                continue
            current.bottom = max(current.bottom, line.y1)
            if OPTION_MARKER.match(text) and line.chunks(gap=4.0)[0].x1 <= MARGIN_X:
                current.option_markers.update(_option_markers(line))
                for option, piece in _split_options(text):
                    current.options[option] = [TextLine(page_index, line.baseline, piece)] if piece else []
            elif option is not None:
                current.options[option].append(as_text)
            else:
                current.stem.append(as_text)


def _joiner(previous: TextLine, line: TextLine, joined: str) -> str:
    if line.page != previous.page or line.baseline - previous.baseline > PARAGRAPH_GAP:
        return '\n'
    # a word broken after a maqaf-style hyphen joins without a space like בין-אישית
    if re.search(r'\S-$', joined):
        return ''
    return ' '


def join_lines(lines: list[TextLine]) -> str:
    out = ''
    for index, line in enumerate(lines):
        out += (_joiner(lines[index - 1], line, out) if index else '') + line.text
    return out


def passage_text(question_set: QuestionSet) -> tuple[str, list[dict[str, int]]]:
    text = ''
    starts: list[int] = []
    for index, line in enumerate(question_set.lines):
        if index:
            text += _joiner(question_set.lines[index - 1], line, text)
        starts.append(len(text))
        text += line.text
    markers = [
        {'line': number, 'offset': starts[position - 1]}
        for number, position in sorted(question_set.line_markers.items())
        if number % 5 == 0
    ]
    return text, markers


@dataclass
class AnswerKey:
    page: int
    tables: dict[tuple[str, str], dict[int, int]]


def parse_answer_key(doc: pymupdf.Document) -> AnswerKey:
    for page_index in range(doc.page_count):
        lines = page_lines(doc[page_index])
        headings = [(line, SECTION_HEADER.search(line.text)) for line in lines]
        headings = [(line, match) for line, match in headings if match]
        # its title is outline lettering that reads doubled - the tables of Correct Options mark the page
        if len(headings) < 2 or not any(line.text.startswith('התשובה') for line in lines):
            continue
        tables: dict[tuple[str, str], dict[int, int]] = {}
        for index, (heading, match) in enumerate(headings):
            bottom = headings[index + 1][0].y0 if index + 1 < len(headings) else CONTENT_BOTTOM
            rows = [_numbers(line) for line in lines if heading.baseline < line.baseline < bottom]
            tables[(DOMAINS[match.group(1)], match.group(2))] = _pair_rows(rows)
        return AnswerKey(page_index, tables)
    raise SystemExit('no Answer Key page found - looked for Section tables with a row of Correct Options')


def _numbers(line: Line) -> list[tuple[int, float]]:
    return [
        (int(chunk.text), (chunk.x0 + chunk.x1) / 2) for chunk in line.chunks(gap=2.5) if chunk.text.isdigit()
    ]


def _pair_rows(rows: list[list[tuple[int, float]]]) -> dict[int, int]:
    numbers = max(rows, key=lambda row: sum(1 for value, _ in row if value > 4))
    correct = next(
        (
            row
            for row in rows
            if row is not numbers and len(row) == len(numbers) and all(1 <= value <= 4 for value, _ in row)
        ),
        None,
    )
    if correct is None:
        raise SystemExit('an Answer Key table has no row of Correct Options lined up under its Question numbers')
    # pair each Correct Option with the Question number printed above it - reading order is not trusted
    return {number: min(correct, key=lambda option: abs(option[1] - x))[0] for number, x in numbers}
