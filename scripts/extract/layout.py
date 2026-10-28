from __future__ import annotations

import unicodedata
from dataclasses import dataclass, field

import pymupdf

BLANK = '____'

# the page header sits above this and the copyright footer below the other
CONTENT_TOP = 50
CONTENT_BOTTOM = 790
# printed text and drawings sit between these margins on every page
CONTENT_LEFT = 60
CONTENT_RIGHT = 535
LINE_TOLERANCE = 2.5
WORD_GAP = 0.14


@dataclass
class Glyph:
    text: str
    x0: float
    x1: float
    y0: float
    y1: float
    size: float
    bold: bool
    italic: bool

    @property
    def bidi(self) -> str:
        if self.text == BLANK:
            return 'ON'
        return unicodedata.bidirectional(self.text[0]) or 'ON'


@dataclass
class Line:
    baseline: float
    glyphs: list[Glyph] = field(default_factory=list)

    @property
    def x0(self) -> float:
        return min(glyph.x0 for glyph in self.glyphs)

    @property
    def x1(self) -> float:
        return max(glyph.x1 for glyph in self.glyphs)

    @property
    def y0(self) -> float:
        return min(glyph.y0 for glyph in self.glyphs)

    @property
    def y1(self) -> float:
        return max(glyph.y1 for glyph in self.glyphs)

    @property
    def size(self) -> float:
        return max(glyph.size for glyph in self.glyphs)

    @property
    def text(self) -> str:
        return logical_text(self.glyphs)

    def chunks(self, gap: float = 8.0) -> list[Line]:
        ordered = sorted(self.glyphs, key=lambda glyph: -glyph.x1)
        parts = [Line(self.baseline, [ordered[0]])]
        for glyph in ordered[1:]:
            if parts[-1].glyphs[-1].x0 - glyph.x1 > gap:
                parts.append(Line(self.baseline, []))
            parts[-1].glyphs.append(glyph)
        return parts


def _glyphs(page: pymupdf.Page) -> list[tuple[float, Glyph]]:
    # accessibility ActualText can hide printed glyphs - one Question number reads as a newline through it
    flags = pymupdf.TEXTFLAGS_RAWDICT | pymupdf.TEXT_IGNORE_ACTUALTEXT
    found: list[tuple[float, Glyph]] = []
    pending = ''
    after_space = True
    for block in page.get_text('rawdict', flags=flags)['blocks']:
        if block['type'] != 0:
            continue
        for line in block['lines']:
            for span in line['spans']:
                font = span['font']
                bold = bool(span['flags'] & pymupdf.TEXT_FONT_BOLD) or 'Bold' in font
                italic = bool(span['flags'] & pymupdf.TEXT_FONT_ITALIC) or 'Italic' in font
                for char in span['chars']:
                    text = char['c']
                    # niqqud mostly follows its letter with zero width - after a space it belongs to the next one
                    if unicodedata.category(text) == 'Mn':
                        if after_space or not found:
                            pending += text
                        else:
                            found[-1][1].text += text
                        continue
                    after_space = not text.strip()
                    if after_space:
                        continue
                    x0, y0, x1, y1 = char['bbox']
                    glyph = Glyph(text + pending, x0, x1, y0, y1, span['size'], bold, italic)
                    pending = ''
                    found.append((char['origin'][1], glyph))
    return found


def _blanks(page: pymupdf.Page) -> list[pymupdf.Rect]:
    # fill-in blanks are short strokes drawn under the baseline - they are not in the text layer
    return [
        drawing['rect']
        for drawing in page.get_drawings()
        if drawing.get('type') == 's'
        and drawing['rect'].height <= 1
        and 10 < drawing['rect'].width < 120
        and all(item[0] == 'l' for item in drawing['items'])
    ]


def page_lines(
    page: pymupdf.Page,
    top: float = CONTENT_TOP,
    bottom: float = CONTENT_BOTTOM,
) -> list[Line]:
    lines: list[Line] = []
    for baseline, glyph in sorted(_glyphs(page), key=lambda pair: pair[0]):
        if not top < baseline < bottom:
            continue
        if lines and abs(lines[-1].baseline - baseline) <= LINE_TOLERANCE:
            lines[-1].glyphs.append(glyph)
        else:
            lines.append(Line(baseline, [glyph]))

    for rect in _blanks(page):
        for line in lines:
            if line.baseline - 2 <= rect.y0 <= line.baseline + 4 and line.x0 - 40 < rect.x0 and rect.x1 < line.x1 + 40:
                line.glyphs.append(Glyph(BLANK, rect.x0, rect.x1, line.baseline - line.size, line.baseline, line.size, False, False))
                break
    return lines


def _ltr_runs(types: list[str], spaced: list[bool]) -> list[bool]:
    # a cut-down unicode bidi pass for an rtl paragraph - marks the glyphs that sit in ltr runs
    types = list(types)
    n = len(types)
    for i in range(1, n - 1):
        # indesign lays out a hyphen between numbers right to left - only separators like . , : join them
        tight = not spaced[i - 1] and not spaced[i]
        if tight and types[i] == 'CS' and types[i - 1] == 'EN' and types[i + 1] == 'EN':
            types[i] = 'EN'
    for i in range(n):
        if types[i] != 'ET':
            continue
        j = i
        while j < n and types[j] == 'ET':
            j += 1
        if (i > 0 and types[i - 1] == 'EN') or (j < n and types[j] == 'EN'):
            for k in range(i, j):
                types[k] = 'EN'

    strong: list[str | None] = []
    for i, kind in enumerate(types):
        if kind == 'L':
            strong.append('L')
        elif kind in ('R', 'AL'):
            strong.append('R')
        elif kind == 'EN':
            # a number glued to latin letters belongs to their run like S2
            touches_latin = (i > 0 and types[i - 1] == 'L') or (i + 1 < n and types[i + 1] == 'L')
            strong.append('L' if touches_latin else 'N')
        else:
            strong.append(None)

    ltr = [kind in ('L', 'EN') for kind in types]
    i = 0
    while i < n:
        if strong[i] is not None:
            i += 1
            continue
        j = i
        while j < n and strong[j] is None:
            j += 1
        if i > 0 and j < n and strong[i - 1] == 'L' and strong[j] == 'L':
            for k in range(i, j):
                ltr[k] = True
        i = j
    return ltr


def logical_text(glyphs: list[Glyph]) -> str:
    # mupdf emits runs in the wrong order - flipped brackets and punctuation at the front - but every glyph
    # sits at its true spot - so read right to left by position and turn ltr runs back around
    ordered = sorted(glyphs, key=lambda glyph: -(glyph.x0 + glyph.x1) / 2)
    if not ordered:
        return ''
    spaced = [
        ordered[i - 1].x0 - ordered[i].x1 > WORD_GAP * max(ordered[i].size, ordered[i - 1].size)
        for i in range(1, len(ordered))
    ]
    ltr = _ltr_runs([glyph.bidi for glyph in ordered], spaced)

    out: list[str] = []
    start = 0
    while start < len(ordered):
        end = start
        while ltr[start] and end + 1 < len(ordered) and ltr[end + 1]:
            end += 1
        if start:
            out.append(' ' if spaced[start - 1] else '')
        for k in range(end, start - 1, -1):
            out.append(ordered[k].text)
            if k > start:
                out.append(' ' if spaced[k - 1] else '')
        start = end + 1
    return ''.join(out)
