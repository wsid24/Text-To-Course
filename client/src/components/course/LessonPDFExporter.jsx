import { useState } from 'react';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import Spinner from '../ui/Spinner';
import toast from 'react-hot-toast';

/**
 * Renders the lesson as a properly paginated PDF.
 *
 * Earlier implementation used html2canvas to snapshot the DOM and slice
 * the image across pages — that caused text overlap at page seams (any
 * block straddling the seam appeared on both pages) and produced large,
 * non-searchable, raster-only PDFs.
 *
 * This version walks the lesson's content array directly and renders each
 * block via jsPDF's text/rect APIs. Output is:
 *   - smaller (text, not raster)
 *   - selectable/searchable
 *   - clean at page boundaries (we add a new page BEFORE writing a block
 *     that wouldn't fit on the remaining space)
 */
export default function LessonPDFExporter({ lesson, courseTitle, filename = 'lesson.pdf' }) {
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    if (!lesson || !Array.isArray(lesson.content) || lesson.content.length === 0) {
      toast.error('Nothing to export yet');
      return;
    }
    setBusy(true);
    try {
      buildPdf(lesson, courseTitle).save(filename);
      toast.success('Lesson downloaded');
    } catch (err) {
      console.error('PDF export failed', err);
      toast.error('PDF export failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={busy}
      className="btn btn-secondary"
      style={{ gap: 6, opacity: busy ? 0.7 : 1 }}
      title="Download this lesson as a PDF"
    >
      {busy ? (<><Spinner size={14} /> Building PDF…</>) : (<><Download size={15} /> Download PDF</>)}
    </button>
  );
}

/* ───────── PDF Builder ───────── */

// A4 portrait dimensions in mm
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_X = 20;
const MARGIN_TOP = 22;
const MARGIN_BOTTOM = 22;
const CONTENT_W = PAGE_W - MARGIN_X * 2;

const COLORS = {
  text: [15, 23, 42],         // slate-900
  muted: [100, 116, 139],     // slate-500
  accent: [6, 182, 212],      // cyan-500
  rule: [226, 232, 240],      // slate-200
  codeBg: [241, 245, 249],    // slate-100
  codeText: [30, 41, 59],     // slate-800
  correct: [16, 185, 129],    // emerald-500
};

function buildPdf(lesson, courseTitle) {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });

  // Cursor + page tracker
  const state = { y: MARGIN_TOP, page: 1, pdf };

  drawHeader(state, lesson.title, courseTitle);
  drawObjectives(state, lesson.objectives);

  let mcqIndex = 0;
  for (const block of lesson.content) {
    if (block.type === 'heading') drawHeading(state, block.text);
    else if (block.type === 'paragraph') drawParagraph(state, block.text);
    else if (block.type === 'code') drawCode(state, block);
    else if (block.type === 'video') drawVideo(state, block);
    else if (block.type === 'mcq') { drawMCQ(state, block, ++mcqIndex); }
  }

  drawFooters(state);
  return pdf;
}

/* ───────── primitives ───────── */

function ensureSpace(state, needed) {
  if (state.y + needed > PAGE_H - MARGIN_BOTTOM) {
    state.pdf.addPage();
    state.page += 1;
    state.y = MARGIN_TOP;
  }
}

function text(state, str, opts = {}) {
  const {
    size = 11,
    font = 'helvetica',
    style = 'normal',
    color = COLORS.text,
    indent = 0,
    lineGap = 1.4,
  } = opts;
  const { pdf } = state;
  pdf.setFont(font, style);
  pdf.setFontSize(size);
  pdf.setTextColor(...color);
  const wrapWidth = CONTENT_W - indent;
  const lines = pdf.splitTextToSize(String(str ?? ''), wrapWidth);
  const lineHeight = size * 0.3528 * lineGap; // pt → mm
  for (const line of lines) {
    ensureSpace(state, lineHeight);
    pdf.text(line, MARGIN_X + indent, state.y + lineHeight * 0.75);
    state.y += lineHeight;
  }
}

function rule(state, gap = 2) {
  ensureSpace(state, gap + 0.4);
  state.y += gap;
  state.pdf.setDrawColor(...COLORS.rule);
  state.pdf.setLineWidth(0.2);
  state.pdf.line(MARGIN_X, state.y, PAGE_W - MARGIN_X, state.y);
  state.y += gap;
}

function spacer(state, mm = 3) {
  state.y += mm;
}

/* ───────── sections ───────── */

function drawHeader(state, lessonTitle, courseTitle) {
  if (courseTitle) {
    text(state, courseTitle.toUpperCase(), {
      size: 8, style: 'bold', color: COLORS.accent, lineGap: 1.3,
    });
    spacer(state, 1);
  }
  text(state, lessonTitle, { size: 22, style: 'bold', lineGap: 1.2 });
  rule(state, 4);
}

function drawObjectives(state, objectives) {
  if (!Array.isArray(objectives) || objectives.length === 0) return;
  text(state, 'Learning Objectives', { size: 11, style: 'bold', color: COLORS.muted });
  spacer(state, 1);
  for (const obj of objectives) {
    text(state, `•  ${obj}`, { size: 10.5, indent: 2, lineGap: 1.45 });
  }
  spacer(state, 4);
}

function drawHeading(state, t) {
  spacer(state, 3);
  text(state, t, { size: 14, style: 'bold', lineGap: 1.3 });
  spacer(state, 1.5);
}

function drawParagraph(state, t) {
  text(state, t, { size: 10.5, lineGap: 1.55, color: [55, 65, 81] });
  spacer(state, 3);
}

function drawCode(state, block) {
  const lang = block.language || 'code';
  const code = String(block.text || '').replace(/\t/g, '  ');
  const lines = code.split('\n');

  // language tag
  text(state, lang.toUpperCase(), {
    size: 7, style: 'bold', color: COLORS.muted, lineGap: 1.2,
  });

  // pre-compute box height (cap to remaining page if needed)
  const lineHeight = 4.5;
  const padding = 4;
  const blockHeight = padding * 2 + lines.length * lineHeight;
  ensureSpace(state, blockHeight + 4);

  // code background rect
  state.pdf.setFillColor(...COLORS.codeBg);
  state.pdf.roundedRect(MARGIN_X, state.y, CONTENT_W, blockHeight, 1.5, 1.5, 'F');

  // code text
  state.pdf.setFont('courier', 'normal');
  state.pdf.setFontSize(9);
  state.pdf.setTextColor(...COLORS.codeText);
  let codeY = state.y + padding + 2.5;
  for (const line of lines) {
    // wrap long lines manually so we don't blow the right edge
    const wrapped = state.pdf.splitTextToSize(line, CONTENT_W - padding * 2);
    for (const w of wrapped) {
      // if we overflow box, paginate inline
      if (codeY > state.y + blockHeight - padding + 0.5) break;
      state.pdf.text(w, MARGIN_X + padding, codeY);
      codeY += lineHeight;
    }
  }
  state.y += blockHeight;
  spacer(state, 4);
}

function drawVideo(state, block) {
  const q = block.query || block.url || '';
  ensureSpace(state, 12);
  state.pdf.setDrawColor(...COLORS.rule);
  state.pdf.setLineWidth(0.2);
  state.pdf.roundedRect(MARGIN_X, state.y, CONTENT_W, 11, 1.5, 1.5, 'S');

  state.pdf.setFont('helvetica', 'bold');
  state.pdf.setFontSize(9);
  state.pdf.setTextColor(...COLORS.accent);
  state.pdf.text('VIDEO REFERENCE', MARGIN_X + 3, state.y + 4.5);

  state.pdf.setFont('helvetica', 'normal');
  state.pdf.setFontSize(9.5);
  state.pdf.setTextColor(...COLORS.text);
  state.pdf.text(`"${q}"`, MARGIN_X + 3, state.y + 8.5);

  state.y += 11;
  spacer(state, 4);
}

function drawMCQ(state, block, idx) {
  // Estimate height (question + 4 options + explanation) to avoid splitting an MCQ
  const estimate = 10 + (block.options?.length || 4) * 6 + 18;
  ensureSpace(state, estimate);

  // Quiz badge
  state.pdf.setFont('helvetica', 'bold');
  state.pdf.setFontSize(8);
  state.pdf.setTextColor(...COLORS.accent);
  state.pdf.text(`QUIZ ${idx}`, MARGIN_X, state.y);
  state.y += 4;

  // Question
  text(state, block.question, { size: 11, style: 'bold', lineGap: 1.4 });
  spacer(state, 1.5);

  // Options
  for (let i = 0; i < (block.options?.length || 0); i += 1) {
    const letter = String.fromCharCode(65 + i);
    const opt = block.options[i];
    const isAnswer = opt === block.answer;
    const prefix = `${letter}.  `;
    const color = isAnswer ? COLORS.correct : COLORS.text;
    const style = isAnswer ? 'bold' : 'normal';
    text(state, prefix + opt, { size: 10, style, color, indent: 4, lineGap: 1.45 });
  }

  // Explanation
  if (block.explanation) {
    spacer(state, 1);
    text(state, `Answer: ${block.answer}`, {
      size: 9, style: 'bold', color: COLORS.correct, lineGap: 1.4,
    });
    text(state, block.explanation, { size: 9, color: COLORS.muted, lineGap: 1.5 });
  }
  spacer(state, 6);
}

function drawFooters(state) {
  const total = state.page;
  const { pdf } = state;
  for (let p = 1; p <= total; p += 1) {
    pdf.setPage(p);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...COLORS.muted);
    pdf.text(`Page ${p} of ${total}`, PAGE_W - MARGIN_X, PAGE_H - 10, { align: 'right' });
    pdf.text('Generated by CourseForge', MARGIN_X, PAGE_H - 10);
  }
}
