#!/usr/bin/env python3
"""Build the public guide from the reviewed Bulgarian source.

Run with Python 3 + reportlab + pypdf and DejaVu fonts installed.
The PDF is checked in; normal frontend builds do not need Python.
"""
from pathlib import Path
import argparse
import hashlib
import html
import json
import re

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    Flowable, KeepTogether, HRFlowable, Image,
)
from reportlab.pdfbase.pdfdoc import PDFString
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'content/metodologiya-budim-se-v2.md'
FONT_ROOT = Path('/usr/share/fonts/truetype/dejavu')
for name, filename in [('Body', 'DejaVuSans.ttf'), ('Bold', 'DejaVuSans-Bold.ttf'),
                       ('Title', 'DejaVuSerif.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(FONT_ROOT / filename)))
pdfmetrics.registerFontFamily('Body', normal='Body', bold='Bold', italic='Body', boldItalic='Bold')

INK = colors.HexColor('#17191d')
MUTED = colors.HexColor('#555a60')
RULE = colors.HexColor('#d0d2d5')
PAPER = colors.HexColor('#f4f4f3')
WIDTH, HEIGHT = A4
MARGIN = 55
CONTENT_WIDTH = WIDTH - MARGIN * 2
styles = {
    'body': ParagraphStyle('BodyText', fontName='Body', fontSize=10.2, leading=15.2,
                           textColor=INK, spaceAfter=9, allowWidows=0, allowOrphans=0),
    'h1': ParagraphStyle('Heading1', fontName='Title', fontSize=20, leading=26,
                         spaceAfter=18, textColor=INK, keepWithNext=True),
    'h2': ParagraphStyle('Heading2', fontName='Bold', fontSize=11.4, leading=16,
                         spaceBefore=9, spaceAfter=6, textColor=INK, keepWithNext=True),
    'list': ParagraphStyle('List', fontName='Body', fontSize=10.2, leading=15.2,
                           leftIndent=13, firstLineIndent=-13, spaceAfter=6, textColor=INK),
    'table': ParagraphStyle('Table', fontName='Body', fontSize=9.2, leading=13.2,
                            textColor=INK, spaceAfter=0),
    'tablehead': ParagraphStyle('TableHead', fontName='Bold', fontSize=9.2, leading=13.2,
                                textColor=INK, spaceAfter=0),
    'note': ParagraphStyle('Note', fontName='Body', fontSize=9.7, leading=14.5,
                           textColor=INK, spaceAfter=0),
    'field': ParagraphStyle('Field', fontName='Bold', fontSize=9.8, leading=14.2,
                            textColor=INK, spaceAfter=0),
    'small': ParagraphStyle('Small', fontName='Body', fontSize=9, leading=14,
                            textColor=MUTED, spaceAfter=8),
}


def inline(value):
    value = html.escape(value, quote=False)
    value = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', value)
    value = re.sub(r'\[([^\]]+)\]\((https?://[^ )]+)\)',
                   lambda m: '<link href="' + m[2] + '"><u>' + m[1] + '</u></link>', value)
    return value


class WritingLines(Flowable):
    def __init__(self, label, count):
        super().__init__()
        self.label = Paragraph(inline(label), styles['field'])
        self.count = count

    def wrap(self, availWidth, availHeight):
        self.width = availWidth
        _, self.label_height = self.label.wrap(availWidth, availHeight)
        self.height = self.label_height + 8 + self.count * 22 + 10
        return self.width, self.height

    def draw(self):
        self.label.drawOn(self.canv, 0, self.height - self.label_height)
        self.canv.setStrokeColor(RULE)
        self.canv.setLineWidth(.5)
        for n in range(self.count):
            y = self.height - self.label_height - 8 - (n + 1) * 22
            self.canv.line(0, y, self.width, y)


class Guide(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph) and flowable.style.name == 'Heading1':
            key = f'page-{self.page}'
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(flowable.getPlainText(), key, level=0)


def page_frame(canvas, doc):
    canvas.saveState()
    canvas._doc.Catalog.Lang = PDFString('bg-BG')
    if doc.page > 1:
        canvas.setFillColor(MUTED)
        canvas.setFont('Body', 8)
        canvas.drawString(MARGIN, HEIGHT - 36, 'БУДИМ СЕ  /  Методология')
        canvas.drawRightString(WIDTH - MARGIN, HEIGHT - 36, 'Образователна методология')
        canvas.setStrokeColor(RULE)
        canvas.setLineWidth(.5)
        canvas.line(MARGIN, HEIGHT - 46, WIDTH - MARGIN, HEIGHT - 46)
    canvas.setStrokeColor(RULE)
    canvas.line(MARGIN, 43, WIDTH - MARGIN, 43)
    canvas.setFillColor(MUTED)
    canvas.setFont('Body', 8)
    canvas.drawString(MARGIN, 28, 'budimse.online  /  Версия 2.0')
    canvas.drawRightString(WIDTH - MARGIN, 28, str(doc.page))
    canvas.restoreState()


def table(rows):
    size = len(rows[0])
    if size == 2:
        widths = [CONTENT_WIDTH * .50, CONTENT_WIDTH * .50]
        if rows[0][0] == 'Част':
            widths = [CONTENT_WIDTH * .70, CONTENT_WIDTH * .30]
    else:
        widths = [CONTENT_WIDTH * .38, CONTENT_WIDTH * .31, CONTENT_WIDTH * .31]
    if rows[0][0] == 'Минути':
        widths = [CONTENT_WIDTH * .15, CONTENT_WIDTH * .44, CONTENT_WIDTH * .41]
    # Comparison tables need a little more room for the measure's label.
    if rows[0][0] in ('Показател', 'Какво броим'):
        widths = [CONTENT_WIDTH * .56, CONTENT_WIDTH * .22, CONTENT_WIDTH * .22]
    data = [[Paragraph(inline(cell or ' '), styles['tablehead' if i == 0 else 'table'])
             for cell in row] for i, row in enumerate(rows)]
    t = Table(data, colWidths=widths, hAlign='LEFT', repeatRows=1)
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BACKGROUND', (0, 0), (-1, 0), PAPER),
        ('LINEABOVE', (0, 0), (-1, 0), .8, INK),
        ('LINEBELOW', (0, 0), (-1, 0), .7, INK),
        ('LINEBELOW', (0, 1), (-1, -1), .4, RULE),
        ('LEFTPADDING', (0, 0), (-1, -1), 9),
        ('RIGHTPADDING', (0, 0), (-1, -1), 9),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    return [t, Spacer(1, 11)]


def render_page(source):
    story = []
    lines = source.strip().splitlines()
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        if line.startswith('# '):
            story.append(Paragraph(inline(line[2:]), styles['h1']))
        elif line.startswith('## '):
            story.append(Paragraph(inline(line[3:]), styles['h2']))
        elif line.startswith('::: lines '):
            match = re.match(r'::: lines (\d+) (.+)', line)
            story.append(WritingLines(match[2], int(match[1])))
        elif line.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                row = [cell.strip() for cell in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r'[-: ]+', cell) for cell in row):
                    rows.append(row)
                i += 1
            story.extend(table(rows))
            continue
        elif line.startswith('> '):
            box = Table([[Paragraph(inline(line[2:]), styles['note'])]], colWidths=[CONTENT_WIDTH])
            box.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), PAPER),
                ('LINEBEFORE', (0, 0), (0, -1), 2, INK),
                ('LEFTPADDING', (0, 0), (-1, -1), 13),
                ('RIGHTPADDING', (0, 0), (-1, -1), 12),
                ('TOPPADDING', (0, 0), (-1, -1), 11),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 11),
            ]))
            story.extend([Spacer(1, 3), box])
        elif line.startswith('- '):
            story.append(Paragraph('•  ' + inline(line[2:]), styles['list']))
        elif re.match(r'^\d+\. ', line):
            story.append(Paragraph(inline(line), styles['list']))
        else:
            paragraph = line
            while i + 1 < len(lines) and lines[i + 1].strip() and not re.match(r'^(#|\||:::|>|- |\d+\. )', lines[i + 1]):
                i += 1
                paragraph += ' ' + lines[i].strip()
            story.append(Paragraph(inline(paragraph), styles['body']))
        i += 1
    return story


def cover():
    title = ParagraphStyle('CoverTitle', fontName='Title', fontSize=31, leading=40, textColor=INK)
    subtitle = ParagraphStyle('CoverSubtitle', fontName='Body', fontSize=15, leading=23, textColor=INK)
    return [
        Spacer(1, 16),
        Image(str(ROOT / 'public/brand/logo-180.png'), width=66, height=66, hAlign='LEFT'),
        Spacer(1, 28),
        Paragraph('Център за медийна и дигитална грамотност', styles['small']),
        Paragraph('БУДИМ СЕ', styles['h2']),
        Spacer(1, 76),
        Paragraph('Методология<br/>„Будим се“', title),
        Spacer(1, 22),
        Paragraph('Медийна и дигитална грамотност<br/>Основания, учебен процес и оценяване', subtitle),
        Spacer(1, 24),
        HRFlowable(width='100%', thickness=.8, color=INK),
        Spacer(1, 18),
        Paragraph('Наблюдение • Проверка • Избор • Опит • Преглед', styles['body']),
        Spacer(1, 44),
        Paragraph('За учители, обучители и водещи на групи', styles['body']),
        Paragraph('Авторска рамка: Владимир Атанасов', styles['small']),
        Paragraph('Версия 2.0 • 9 октомври 2026 г.', styles['small']),
    ]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, default=ROOT / 'output/pdf/metodologiya-budim-se-v2.pdf')
    args = parser.parse_args()
    text = SOURCE.read_text(encoding='utf-8')
    for char in ('\u2011', '\u2013', '\u2014'):
        if char in text:
            raise ValueError('Use ASCII hyphens in the guide source.')
    pages = text.split('<!-- page -->')
    assert len(pages) == 46, f'Expected 46 designed pages, got {len(pages)}'
    args.output.parent.mkdir(parents=True, exist_ok=True)
    doc = Guide(str(args.output), pagesize=A4, rightMargin=MARGIN, leftMargin=MARGIN,
                topMargin=65, bottomMargin=59, pageCompression=1,
                title='Методология „Будим се“ - основания, учебен процес и оценяване',
                author='Център БУДИМ СЕ; Владимир Атанасов',
                subject='Медийна и дигитална грамотност: практика, занятия и работни листове',
                keywords='медийна грамотност, дигитална грамотност, Будим се, методология')
    story = cover()
    for part in pages[1:]:
        story.append(PageBreak())
        story.extend(render_page(part))
    doc.build(story, onFirstPage=page_frame, onLaterPages=page_frame)
    reader = PdfReader(args.output)
    expected_titles = [re.search(r'^# (.+)$', part, re.M)[1] for part in pages]
    assert len(reader.pages) == len(pages), f'Overflow: {len(reader.pages)} pages, expected {len(pages)}'
    for index, (page, title) in enumerate(zip(reader.pages, expected_titles)):
        extracted = re.sub(r'\s+', ' ', page.extract_text())
        assert title in extracted, f'Wrong page break before page {index + 1}: {title}'
    metadata = {
        'title': 'Методология „Будим се“',
        'version': '2.0', 'publishedAt': '2026-10-09', 'dateLabel': '9 октомври 2026 г.', 'pages': len(reader.pages),
        'bytes': args.output.stat().st_size,
        'href': '/resources/metodologiya-budim-se-v2.pdf',
        'worksheetPages': '39-44', 'worksheets': 6,
        'sections': {'caseStudy': '15-16', 'socialPosts': '20-23', 'course': '28', 'lesson': '29', 'assessment': '33-38'},
        'sha256': hashlib.sha256(args.output.read_bytes()).hexdigest(),
    }
    (ROOT / 'content/methodology-resource.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(metadata, ensure_ascii=False))


if __name__ == '__main__':
    main()
