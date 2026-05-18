import type { CodeSection } from "@/app/api/generate/route";

export interface PdfExportOptions {
  question: string;
  sections: CodeSection[];
  language: string;
  filename?: string;
}

export async function exportElementToPdf({
  question,
  sections,
  language,
  filename = "code-answer",
}: PdfExportOptions): Promise<void> {
  const sectionsHtml = sections
    .map((section, index) => {
      const cleanOutput = section.output
        .replace(/^Programming Question:.*\n?/i, "")
        .replace(/^Question:.*\n?/i, "")
        .replace(new RegExp(`^${escapeRegex(question.trim())}\\s*`, "i"), "")
        .trim();

      const highlighted = highlightCode(section.code, language);
      const numberedLines = highlighted
        .split("\n")
        .map(
          (line, i) =>
            `<span class="line"><span class="ln">${i + 1}</span><span class="lc">${line || " "}</span></span>`
        )
        .join("\n");

      return `
        <div class="section">
          <div class="section-header">
            <div class="section-pill">${index + 1}</div>
            <span class="section-title">${escapeHtml(section.title ?? `Program ${index + 1}`)}</span>
            <span class="lang-badge">${language.toUpperCase()}</span>
          </div>

          ${section.description ? `<div class="section-desc">${escapeHtml(section.description)}</div>` : ""}

          <div class="code-block">
            <div class="code-topbar">
              <div class="tls">
                <span class="tl tl-r"></span>
                <span class="tl tl-y"></span>
                <span class="tl tl-g"></span>
              </div>
              <span class="code-fname">${language === "c" ? "main.c" : "main.py"}</span>
            </div>
            <pre class="code-pre">${numberedLines}</pre>
          </div>

          ${cleanOutput ? `
          <div class="output-block">
            <div class="output-topbar">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="4 17 10 11 4 5"></polyline>
                <line x1="12" y1="19" x2="20" y2="19"></line>
              </svg>
              <span class="output-label">Output</span>
            </div>
            <pre class="output-pre">${escapeHtml(cleanOutput)}</pre>
          </div>` : ""}
        </div>
      `;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    @page {
      size: A4;
      margin: 0;
      @top-left   { content: ""; }
      @top-right  { content: ""; }
      @bottom-left  { content: ""; }
      @bottom-right { content: ""; }
    }

    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      background: #0f111a;
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 9.5pt;
      color: #f8fafc;
      line-height: 1;
    }

    .page {
      min-height: 297mm;
      display: flex;
      flex-direction: row;
    }

    .sidebar {
      width: 6pt;
      background: #1a1d2d;
      flex-shrink: 0;
    }

    .content {
      flex: 1;
      padding: 28pt 32pt 28pt 26pt;
      background: #0f111a;
    }

    /* ── Header ── */
    .cover-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 20pt;
      padding-bottom: 14pt;
      border-bottom: 1.5pt solid #2e354f;
    }

    .doc-eyebrow {
      font-size: 7pt;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #7c3aed;
      margin-bottom: 5pt;
    }

    .doc-title {
      font-size: 14pt;
      font-weight: 700;
      color: #f8fafc;
      line-height: 1;
      max-width: 370pt;
    }

    .cover-meta {
      text-align: right;
      flex-shrink: 0;
      padding-left: 16pt;
    }

    .meta-badge {
      display: inline-block;
      background: #7c3aed;
      color: #ffffff;
      font-size: 7.5pt;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 3pt 10pt;
      border-radius: 20pt;
      margin-bottom: 5pt;
    }

    .meta-date, .meta-count {
      font-size: 7.5pt;
      color: #828da9;
      display: block;
    }

    /* ── Section ── */
    .section {
      margin-bottom: 18pt;
      border-radius: 8pt;
      border: 1pt solid #2e354f;
      background: #11141f;
      overflow: hidden;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .section-header {
      background: #1a1d2d;
      padding: 10pt 12pt;
      display: flex;
      align-items: center;
      gap: 8pt;
      border-bottom: 1pt solid #2e354f;
    }

    .section-pill {
      width: 17pt;
      height: 17pt;
      border-radius: 50%;
      background: #7c3aed;
      color: #ffffff;
      font-size: 8pt;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .section-title {
      font-size: 9.5pt;
      font-weight: 600;
      color: #f8fafc;
      flex: 1;
    }

    .lang-badge {
      font-size: 6.5pt;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: #828da9;
      background: transparent;
      padding: 2pt 7pt;
      border-radius: 4pt;
      border: 0.5pt solid #3b4261;
    }

    .section-desc {
      background: transparent;
      padding: 10pt 12pt 4pt 12pt;
      font-size: 8pt;
      color: #828da9;
    }

    /* ── Code ── */
    .code-block {
      margin: 10pt;
      border-radius: 8pt;
      border: 1pt solid #2e354f;
      overflow: hidden;
    }
    
    .code-topbar {
      background: #1a1d2d;
      padding: 6pt 12pt;
      display: flex;
      align-items: center;
      gap: 10pt;
    }

    .tls { display: flex; gap: 4pt; align-items: center; }
    .tl { width: 7pt; height: 7pt; border-radius: 50%; display: inline-block; }
    .tl-r { background: #ff5f57; }
    .tl-y { background: #febc2e; }
    .tl-g { background: #28c840; }

    .code-fname {
      font-size: 7.5pt;
      font-weight: 600;
      color: #828da9;
      font-family: 'Courier New', monospace;
    }

    .code-pre {
      background: #1a1d2d;
      font-family: 'Courier New', Courier, monospace;
      font-size: 7.5pt;
      line-height: 1.15;
      padding: 2pt 0 6pt 0;
      white-space: pre-wrap;
      word-break: break-word;
      margin: 0;
      overflow: visible;
    }

    .line {
      display: block;
      min-height: 1.15em;
    }

    .ln {
      display: inline-block;
      width: 24pt;
      text-align: right;
      padding-right: 10pt;
      color: #4f5b70;
      font-size: 6.5pt;
      margin-right: 2pt;
      user-select: none;
    }

    .lc { color: #a9b1d6; }

    /* ── Syntax token colors (Tokyo Night theme) ── */
    .kw  { color: #ff79c6; }                      /* keywords */
    .fn  { color: #82aaff; }                      /* function names */
    .str { color: #c3e88d; }                      /* strings & char literals */
    .cm  { color: #636da6; font-style: italic; }  /* comments */
    .num { color: #f78c6c; }                      /* numbers */
    .pp  { color: #ff79c6; }                      /* preprocessor */
    .ty  { color: #ffcb6b; }                      /* types */
    .op  { color: #89ddff; } 

    /* ── Output ── */
    .output-block {
      border: 1pt solid #2e354f;
      border-radius: 8pt;
      margin: 0 10pt 10pt 10pt;
      overflow: hidden;
    }

    .output-topbar {
      background: #1a1d2d;
      border-bottom: 1pt solid #2e354f;
      padding: 6pt 12pt;
      display: flex;
      align-items: center;
      gap: 6pt;
    }

    .output-label {
      font-size: 7.5pt;
      font-weight: 700;
      color: #10b981;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      font-family: 'Courier New', monospace;
    }

    .output-pre {
      background: #0f111a;
      color: #10b981;
      font-family: 'Courier New', Courier, monospace;
      font-size: 7.5pt;
      line-height: 1.15;
      padding: 6pt 12pt;
      white-space: pre-wrap;
      word-break: break-word;
      margin: 0;
    }

    /* ── Footer ── */
    .footer {
      margin-top: 16pt;
      padding-top: 10pt;
      border-top: 1pt solid #2e354f;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-left {
      display: flex;
      align-items: center;
      gap: 6pt;
    }

    .footer-dot {
      width: 6pt;
      height: 6pt;
      border-radius: 50%;
      background: #4f5b70;
    }

    .footer-brand {
      font-size: 8pt;
      font-weight: 700;
      color: #4f5b70;
      letter-spacing: 0.06em;
    }

    .footer-right {
      font-size: 7.5pt;
      color: #4f5b70;
    }
  </style>
</head>
<body>
<div class="page">
  <div class="sidebar"></div>
  <div class="content">

    <div class="cover-header">
      <div class="cover-left">
        <div class="doc-eyebrow">Programming Solution</div>
        <div class="doc-title">${escapeHtml(question)}</div>
      </div>
      <div class="cover-meta">
        <div class="meta-badge">${language.toUpperCase()}</div>
        <span class="meta-date">${new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}</span>
        <span class="meta-count">${sections.length} program${sections.length !== 1 ? "s" : ""}</span>
      </div>
    </div>

    ${sectionsHtml}

    <div class="footer">
      <div class="footer-left">
        <div class="footer-dot"></div>
        <span class="footer-brand">CodeDoc</span>
      </div>
      <div class="footer-right">${new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })}</div>
    </div>

  </div>
</div>
</body>
</html>`;

  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    "position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;border:none;visibility:hidden;";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument!;
  doc.open();
  doc.write(html);
  doc.close();

  await new Promise<void>((resolve) => {
    iframe.onload = () => resolve();
    setTimeout(resolve, 1000);
  });

  const originalTitle = document.title;
  document.title = filename;
  iframe.contentWindow!.focus();
  iframe.contentWindow!.print();
  document.title = originalTitle;

  setTimeout(() => document.body.removeChild(iframe), 2000);
}

// ─────────────────────────────────────────────
// Lightweight syntax highlighter (no deps)
// Produces HTML spans with token classes
// ─────────────────────────────────────────────
function highlightCode(code: string, language: string): string {
  const escaped = escapeHtml(code);

  if (language === "c") {
    return escaped
      // Comments (must come first)
      .replace(/(\/\/[^\n]*)/g, '<span class="cm">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="cm">$1</span>')
      // Preprocessor directives
      .replace(/(#\s*(?:include|define|ifdef|ifndef|endif|pragma|undef)[^\n]*)/g,
        '<span class="pp">$1</span>')
      // Strings
      .replace(/(&quot;(?:[^&]|&(?!quot;))*?&quot;)/g, '<span class="str">$1</span>')
      // Char literals
      .replace(/(&#039;(?:[^&]|&(?!#039;))*?&#039;)/g, '<span class="str">$1</span>')
      // Types
      .replace(/\b(int|char|float|double|void|long|short|unsigned|signed|size_t|struct|union|enum|typedef|FILE)\b/g,
        '<span class="ty">$1</span>')
      // Keywords
      .replace(/\b(if|else|for|while|do|return|break|continue|switch|case|default|goto|sizeof|static|extern|const|volatile|register|auto|inline)\b/g,
        '<span class="kw">$1</span>')
      // Function calls — word followed by (
      .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*\()/g, '<span class="fn">$1</span>')
      // Numbers
      .replace(/\b(\d+\.?\d*(?:[eE][+-]?\d+)?[fFlLuU]*)\b/g, '<span class="num">$1</span>');
  }

  if (language === "python") {
    return escaped
      // Comments
      .replace(/(#[^\n]*)/g, '<span class="cm">$1</span>')
      // Triple-quoted strings
      .replace(/((?:&quot;){3}[\s\S]*?(?:&quot;){3})/g, '<span class="str">$1</span>')
      // Strings
      .replace(/(&quot;[^&\n]*?&quot;|&#039;[^&\n]*?&#039;)/g, '<span class="str">$1</span>')
      // Types / builtins
      .replace(/\b(int|float|str|bool|list|dict|set|tuple|None|True|False|type|len|range|print|input|open|object)\b/g,
        '<span class="ty">$1</span>')
      // Keywords
      .replace(/\b(def|class|if|elif|else|for|while|return|import|from|as|with|try|except|finally|raise|pass|break|continue|lambda|yield|global|nonlocal|and|or|not|in|is|del|assert|async|await)\b/g,
        '<span class="kw">$1</span>')
      // Decorators
      .replace(/(@[a-zA-Z_][a-zA-Z0-9_.]*)/g, '<span class="pp">$1</span>')
      // Function calls
      .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*\()/g, '<span class="fn">$1</span>')
      // Numbers
      .replace(/\b(\d+\.?\d*(?:[eE][+-]?\d+)?[jJ]?)\b/g, '<span class="num">$1</span>');
  }

  return escaped;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}