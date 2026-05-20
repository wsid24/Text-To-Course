/**
 * One-shot script that converts docs/INTERVIEW_PREP.md into a clean PDF
 * using the jsPDF already installed in client/node_modules.
 *
 * Run from repo root:    node scripts/build-interview-pdf.js
 * Output:                docs/INTERVIEW_PREP.pdf
 *
 * Markdown subset supported (covers everything in INTERVIEW_PREP.md):
 *   #, ##, ###     headings (3 levels)
 *   - / *          bullet lists
 *   `inline code`  monospace inline runs
 *   ```code```     code blocks (boxed, monospace)
 *   > quote        block quotes
 *   **bold**       bold runs (whole-line or inline)
 *   plain prose    serif body
 */
const fs = require("fs");
const path = require("path");

const MD_PATH = path.resolve(__dirname, "..", "docs", "INTERVIEW_PREP.md");
const PDF_PATH = path.resolve(__dirname, "..", "docs", "INTERVIEW_PREP.pdf");
const JSPDF_PATH = path.resolve(
  __dirname,
  "..",
  "client",
  "node_modules",
  "jspdf",
  "dist",
  "jspdf.node.es.min.js",
);

// jsPDF ships an ES build. Use dynamic import.
(async () => {
  const jspdfModulePath = fs.existsSync(JSPDF_PATH)
    ? JSPDF_PATH
    : require.resolve("jspdf", { paths: [path.resolve(__dirname, "..", "client")] });
  const { jsPDF } = await import(jspdfModulePath);

  const md = fs.readFileSync(MD_PATH, "utf8");
  buildPdf(md, jsPDF).save(PDF_PATH);
  console.log(`✓ wrote ${PDF_PATH}`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

/* ─────────────────────── layout constants ─────────────────────── */

const PAGE_W = 210;        // A4 width  in mm
const PAGE_H = 297;        // A4 height in mm
const MX = 18;             // horizontal margin
const TOP = 22;
const BOTTOM = 20;
const CONTENT_W = PAGE_W - MX * 2;

const COLORS = {
  text: [22, 27, 34],
  body: [55, 65, 81],
  muted: [100, 116, 139],
  accent: [6, 182, 212],
  accentDeep: [8, 145, 178],
  rule: [226, 232, 240],
  codeBg: [241, 245, 249],
  codeText: [30, 41, 59],
  quoteBg: [240, 253, 255],
  quoteBar: [6, 182, 212],
};

/* ─────────────────────── builder ─────────────────────── */

function buildPdf(md, jsPDF) {
  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const state = { y: TOP, page: 1, pdf };

  drawCover(state);
  renderMarkdown(state, md);
  drawFooters(state);

  return pdf;
}

/* ─────────────────────── cover ─────────────────────── */

function drawCover(state) {
  const { pdf } = state;

  // background panel
  pdf.setFillColor(...COLORS.accent);
  pdf.rect(0, 0, PAGE_W, 70, "F");

  // subtle gradient effect via overlay
  pdf.setFillColor(...COLORS.accentDeep);
  pdf.rect(0, 50, PAGE_W, 20, "F");

  // title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(34);
  pdf.setTextColor(255, 255, 255);
  pdf.text("CourseForge", MX, 30);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(13);
  pdf.text("Interview Preparation Pack", MX, 40);

  pdf.setFontSize(9);
  pdf.text("AI-powered course generator — full-stack project deep-dive", MX, 50);

  // start content below cover
  state.y = 85;

  // sub-info row
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(...COLORS.muted);
  pdf.text("Live demo:  text2course-nu.vercel.app", MX, state.y);
  pdf.text("API:  text-to-course.onrender.com", MX, state.y + 5);
  state.y += 14;

  ruleLine(state);
  spacer(state, 4);
}

/* ─────────────────────── markdown loop ─────────────────────── */

function renderMarkdown(state, md) {
  const lines = md.split("\n");
  let i = 0;
  let inCode = false;
  let codeBuf = [];
  let codeLang = "";

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.replace(/\r$/, "");

    // fenced code blocks
    if (line.startsWith("```")) {
      if (!inCode) {
        inCode = true;
        codeLang = line.slice(3).trim();
        codeBuf = [];
      } else {
        inCode = false;
        drawCodeBlock(state, codeBuf, codeLang);
      }
      i += 1;
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      i += 1;
      continue;
    }

    // headings
    if (/^# /.test(line)) { drawH1(state, line.slice(2)); i += 1; continue; }
    if (/^## /.test(line)) { drawH2(state, line.slice(3)); i += 1; continue; }
    if (/^### /.test(line)) { drawH3(state, line.slice(4)); i += 1; continue; }

    // blockquote
    if (/^> /.test(line)) {
      // gather contiguous quote lines
      const quote = [line.slice(2)];
      while (i + 1 < lines.length && /^> /.test(lines[i + 1])) {
        i += 1;
        quote.push(lines[i].slice(2));
      }
      drawQuote(state, quote.join(" "));
      i += 1;
      continue;
    }

    // bullets
    if (/^[-*]\s+/.test(line)) {
      drawBullet(state, line.replace(/^[-*]\s+/, ""));
      i += 1;
      continue;
    }

    // blank line
    if (line.trim() === "") {
      spacer(state, 2);
      i += 1;
      continue;
    }

    // plain paragraph — accumulate adjacent non-blank, non-special lines
    const buf = [line];
    while (
      i + 1 < lines.length &&
      lines[i + 1].trim() !== "" &&
      !/^[#>\-*`]/.test(lines[i + 1]) &&
      !/^\s*$/.test(lines[i + 1]) &&
      !lines[i + 1].startsWith("```")
    ) {
      i += 1;
      buf.push(lines[i]);
    }
    drawParagraph(state, buf.join(" "));
    i += 1;
  }
}

/* ─────────────────────── primitives ─────────────────────── */

function ensure(state, needed) {
  if (state.y + needed > PAGE_H - BOTTOM) {
    state.pdf.addPage();
    state.page += 1;
    state.y = TOP;
  }
}

function spacer(state, mm = 3) {
  state.y += mm;
}

function ruleLine(state) {
  ensure(state, 2);
  state.pdf.setDrawColor(...COLORS.rule);
  state.pdf.setLineWidth(0.2);
  state.pdf.line(MX, state.y, PAGE_W - MX, state.y);
  state.y += 2;
}

/* ─────────────────────── inline text with bold + code spans ─────────────────────── */

/**
 * Renders a paragraph with simple **bold** and `code` inline runs.
 * splitTextToSize doesn't handle mixed fonts on a single line, so we
 * tokenize manually and use jsPDF's text-with-font-changes pattern.
 */
function drawRichLine(state, text, opts) {
  const { size, color, lineHeight, indent = 0 } = opts;
  const { pdf } = state;
  const tokens = tokenize(text);

  // line-wrap by laying tokens until they overflow CONTENT_W
  const wrapWidth = CONTENT_W - indent;
  let cursorX = MX + indent;
  let startX = MX + indent;
  let lineTokens = [];

  const flushLine = () => {
    if (lineTokens.length === 0) return;
    ensure(state, lineHeight);
    let x = startX;
    for (const t of lineTokens) {
      pdf.setFont(t.style === "code" ? "courier" : "helvetica", t.style === "bold" ? "bold" : "normal");
      pdf.setFontSize(size);
      pdf.setTextColor(...(t.style === "code" ? COLORS.codeText : color));
      pdf.text(t.text, x, state.y + lineHeight * 0.75);
      x += measure(pdf, t.text, size, t.style);
    }
    state.y += lineHeight;
    lineTokens = [];
    cursorX = startX;
  };

  for (const tok of tokens) {
    const w = measure(pdf, tok.text, size, tok.style);
    if (cursorX + w > MX + indent + wrapWidth && lineTokens.length > 0) {
      flushLine();
    }
    if (w > wrapWidth) {
      // single huge token: hard-wrap
      const parts = pdf.splitTextToSize(tok.text, wrapWidth);
      for (const p of parts) {
        lineTokens.push({ ...tok, text: p });
        cursorX += measure(pdf, p, size, tok.style);
        flushLine();
      }
      continue;
    }
    lineTokens.push(tok);
    cursorX += w;
  }
  flushLine();
}

function measure(pdf, text, size, style) {
  pdf.setFont(style === "code" ? "courier" : "helvetica", style === "bold" ? "bold" : "normal");
  pdf.setFontSize(size);
  return pdf.getTextWidth(text);
}

function tokenize(s) {
  // walk through string, splitting on **bold** and `code`
  const out = [];
  let i = 0;
  while (i < s.length) {
    if (s.startsWith("**", i)) {
      const end = s.indexOf("**", i + 2);
      if (end !== -1) {
        emitText(out, s.slice(i + 2, end), "bold");
        i = end + 2;
        continue;
      }
    }
    if (s[i] === "`") {
      const end = s.indexOf("`", i + 1);
      if (end !== -1) {
        emitText(out, s.slice(i + 1, end), "code");
        i = end + 1;
        continue;
      }
    }
    // accumulate plain run until next special
    let j = i;
    while (j < s.length && !s.startsWith("**", j) && s[j] !== "`") j += 1;
    if (j > i) {
      emitText(out, s.slice(i, j), "plain");
    }
    i = j;
  }
  return out;
}

function emitText(out, text, style) {
  // break into space-separated atoms so we can word-wrap
  const parts = text.split(/(\s+)/);
  for (const p of parts) {
    if (p.length > 0) out.push({ text: p, style });
  }
}

/* ─────────────────────── block renderers ─────────────────────── */

function drawH1(state, t) {
  spacer(state, 4);
  ensure(state, 14);
  state.pdf.setFont("helvetica", "bold");
  state.pdf.setFontSize(20);
  state.pdf.setTextColor(...COLORS.text);
  const lines = state.pdf.splitTextToSize(t, CONTENT_W);
  for (const l of lines) {
    ensure(state, 9);
    state.pdf.text(l, MX, state.y + 7);
    state.y += 9;
  }
  // accent underline
  state.pdf.setDrawColor(...COLORS.accent);
  state.pdf.setLineWidth(0.8);
  state.pdf.line(MX, state.y + 1, MX + 14, state.y + 1);
  state.y += 4;
}

function drawH2(state, t) {
  spacer(state, 4);
  ensure(state, 11);
  state.pdf.setFont("helvetica", "bold");
  state.pdf.setFontSize(14);
  state.pdf.setTextColor(...COLORS.accentDeep);
  const lines = state.pdf.splitTextToSize(t, CONTENT_W);
  for (const l of lines) {
    ensure(state, 7.5);
    state.pdf.text(l, MX, state.y + 5.5);
    state.y += 7.5;
  }
  spacer(state, 1);
}

function drawH3(state, t) {
  spacer(state, 2);
  ensure(state, 8);
  state.pdf.setFont("helvetica", "bold");
  state.pdf.setFontSize(11);
  state.pdf.setTextColor(...COLORS.text);
  const lines = state.pdf.splitTextToSize(t, CONTENT_W);
  for (const l of lines) {
    ensure(state, 6);
    state.pdf.text(l, MX, state.y + 4.5);
    state.y += 6;
  }
  spacer(state, 0.5);
}

function drawParagraph(state, text) {
  drawRichLine(state, text, {
    size: 9.5, color: COLORS.body, lineHeight: 4.7,
  });
  spacer(state, 2);
}

function drawBullet(state, text) {
  // draw bullet glyph manually so wrapping aligns
  ensure(state, 4.7);
  state.pdf.setFont("helvetica", "bold");
  state.pdf.setFontSize(9);
  state.pdf.setTextColor(...COLORS.accent);
  state.pdf.text("•", MX + 1.5, state.y + 3.6);

  drawRichLine(state, text, {
    size: 9.5, color: COLORS.body, lineHeight: 4.7, indent: 6,
  });
  spacer(state, 0.4);
}

function drawQuote(state, text) {
  // measure how tall the wrapped text will be
  state.pdf.setFont("helvetica", "italic");
  state.pdf.setFontSize(10);
  const wrap = state.pdf.splitTextToSize(text, CONTENT_W - 8);
  const height = wrap.length * 5 + 4;
  ensure(state, height);

  // bg + bar
  state.pdf.setFillColor(...COLORS.quoteBg);
  state.pdf.rect(MX, state.y, CONTENT_W, height, "F");
  state.pdf.setFillColor(...COLORS.quoteBar);
  state.pdf.rect(MX, state.y, 1.2, height, "F");

  // text
  state.pdf.setTextColor(...COLORS.text);
  let yy = state.y + 4;
  for (const l of wrap) {
    state.pdf.text(l, MX + 4, yy);
    yy += 5;
  }
  state.y += height;
  spacer(state, 2);
}

function drawCodeBlock(state, lines, lang) {
  // pre-compute height
  const lineH = 4;
  const pad = 3;
  let allLines = [];
  state.pdf.setFont("courier", "normal");
  state.pdf.setFontSize(8.5);
  for (const l of lines) {
    const wrapped = state.pdf.splitTextToSize(l || " ", CONTENT_W - pad * 2);
    allLines = allLines.concat(wrapped);
  }
  let consumed = 0;
  while (consumed < allLines.length) {
    const remaining = PAGE_H - BOTTOM - state.y - 8;
    const fit = Math.max(1, Math.floor((remaining - pad * 2) / lineH));
    const slice = allLines.slice(consumed, consumed + fit);
    const h = pad * 2 + slice.length * lineH;
    ensure(state, h + (lang && consumed === 0 ? 5 : 0));

    if (lang && consumed === 0) {
      state.pdf.setFont("helvetica", "bold");
      state.pdf.setFontSize(7);
      state.pdf.setTextColor(...COLORS.muted);
      state.pdf.text(lang.toUpperCase(), MX, state.y + 3);
      state.y += 4;
    }

    state.pdf.setFillColor(...COLORS.codeBg);
    state.pdf.roundedRect(MX, state.y, CONTENT_W, h, 1.5, 1.5, "F");

    state.pdf.setFont("courier", "normal");
    state.pdf.setFontSize(8.5);
    state.pdf.setTextColor(...COLORS.codeText);
    let yy = state.y + pad + 3;
    for (const l of slice) {
      state.pdf.text(l, MX + pad, yy);
      yy += lineH;
    }
    state.y += h;
    consumed += fit;
    if (consumed < allLines.length) {
      spacer(state, 1);
    }
  }
  spacer(state, 3);
}

/* ─────────────────────── footers ─────────────────────── */

function drawFooters(state) {
  const total = state.page;
  const { pdf } = state;
  for (let p = 1; p <= total; p += 1) {
    pdf.setPage(p);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...COLORS.muted);
    if (p > 1) {
      pdf.text(`CourseForge · Interview Prep`, MX, PAGE_H - 8);
      pdf.text(`${p} / ${total}`, PAGE_W - MX, PAGE_H - 8, { align: "right" });
    }
  }
}
