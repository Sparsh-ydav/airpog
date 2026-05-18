"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import type { CodeSection } from "../api/generate/route";

// Exact Tokyo Night / Synthwave theme matching the screenshot
const tokyoNight = {
  'code[class*="language-"]': {
    color: "#a9b1d6",
    background: "transparent",
    fontFamily: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
    fontSize: "12px",
    lineHeight: "1",
  },
  'pre[class*="language-"]': {
    color: "#a9b1d6",
    background: "#1a1d2d",
    fontFamily: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
    fontSize: "12px",
    lineHeight: "1",
    margin: "0",
    padding: "0",
    overflow: "visible",
  },
  comment: { color: "#636da6", fontStyle: "italic" },
  prolog: { color: "#636da6" },
  doctype: { color: "#636da6" },
  cdata: { color: "#636da6" },
  punctuation: { color: "#a9b1d6" },
  property: { color: "#a9b1d6" },
  tag: { color: "#ff79c6" },
  boolean: { color: "#f78c6c" },
  number: { color: "#f78c6c" },
  constant: { color: "#f78c6c" },
  symbol: { color: "#f78c6c" },
  deleted: { color: "#ff79c6" },
  selector: { color: "#c3e88d" },
  "attr-name": { color: "#82aaff" },
  string: { color: "#c3e88d" },
  char: { color: "#c3e88d" },
  builtin: { color: "#82aaff" },
  inserted: { color: "#c3e88d" },
  operator: { color: "#89ddff" },
  entity: { color: "#82aaff" },
  url: { color: "#89ddff" },
  variable: { color: "#a9b1d6" },
  atrule: { color: "#ff79c6" },
  "attr-value": { color: "#c3e88d" },
  function: { color: "#82aaff" },
  "function-variable": { color: "#82aaff" },
  "class-name": { color: "#ffcb6b" },
  keyword: { color: "#ff79c6" },
  regex: { color: "#c3e88d" },
  important: { color: "#ff79c6", fontWeight: "bold" },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
  namespace: { opacity: "0.7" },
};

interface CodePreviewProps {
  question: string;
  summary: string;
  sections: CodeSection[];
  language: string;
  onSectionsChange: (sections: CodeSection[]) => void;
}

export default function CodePreview({
  question,
  summary,
  sections,
  language,
  onSectionsChange,
}: CodePreviewProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editOutput, setEditOutput] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  function handleCopy(code: string, index: number) {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  function handleEditStart(index: number) {
    setEditCode(sections[index].code);
    setEditOutput(sections[index].output);
    setEditingIndex(index);
  }

  function handleEditSave(index: number) {
    const updated = sections.map((s, i) =>
      i === index ? { ...s, code: editCode, output: editOutput } : s
    );
    onSectionsChange(updated);
    setEditingIndex(null);
  }

  return (
    <div
      id="pdf-preview-content"
      className="rounded-xl overflow-hidden"
      style={{ background: "#0f111a", border: "1px solid #2e354f" }}
    >
      {/* Window chrome */}
      <div
        style={{
          background: "#1a1d2d",
          borderBottom: "1px solid #2e354f",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
        <span style={{ marginLeft: 8, fontSize: 12, color: "#828da9", fontFamily: "monospace" }}>
          {language === "c" ? "main.c" : "main.py"}
        </span>
      </div>

      <div style={{ padding: "20px 20px" }}>
        {/* Question */}
        <div
          style={{
            borderLeft: "3px solid #7c3aed",
            paddingLeft: "14px",
            marginBottom: "20px",
            borderRadius: 0,
          }}
        >
          <p style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
            Question
          </p>
          <p style={{ color: "#f8fafc", fontSize: 14, fontWeight: 500, lineHeight: 1.5 }}>
            {question}
          </p>
        </div>

        {/* Summary */}
        {summary && (
          <p style={{ color: "#828da9", fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
            {summary}
          </p>
        )}

        {sections.map((section, index) => (
          <div
            key={index}
            style={{
              marginBottom: 20,
              borderRadius: 8,
              border: "1px solid #2e354f",
              background: "#11141f",
              overflow: "hidden",
            }}
          >
            {/* Section header */}
            <div
              style={{
                background: "#1a1d2d",
                borderBottom: "1px solid #2e354f",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "#7c3aed",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {index + 1}
              </span>
              <span style={{ color: "#f8fafc", fontSize: 13, fontWeight: 600, flex: 1 }}>
                {section.title}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                {editingIndex === index ? (
                  <>
                    <button
                      onClick={() => setEditingIndex(null)}
                      style={{ fontSize: 11, padding: "4px 12px", borderRadius: 6, background: "transparent", border: "1px solid #3b4261", color: "#828da9", cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEditSave(index)}
                      style={{ fontSize: 11, padding: "4px 12px", borderRadius: 6, background: "#7c3aed", border: "none", color: "#fff", cursor: "pointer" }}
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleEditStart(index)}
                    style={{ fontSize: 11, padding: "4px 12px", borderRadius: 6, background: "transparent", border: "1px solid #3b4261", color: "#828da9", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            {section.description && (
              <div style={{ padding: "12px 14px 4px 14px" }}>
                <p style={{ color: "#828da9", fontSize: 12 }}>{section.description}</p>
              </div>
            )}

            {editingIndex === index ? (
              <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ fontSize: 10, color: "#828da9", textTransform: "uppercase", letterSpacing: "0.08em" }}>Code</p>
                <textarea
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  rows={10}
                  style={{ width: "100%", background: "#1a1d2d", border: "1px solid #7c3aed", borderRadius: 6, color: "#a9b1d6", padding: "10px 14px", fontSize: 12, fontFamily: "monospace", resize: "vertical", outline: "none" }}
                />
                <p style={{ fontSize: 10, color: "#828da9", textTransform: "uppercase", letterSpacing: "0.08em" }}>Output</p>
                <textarea
                  value={editOutput}
                  onChange={(e) => setEditOutput(e.target.value)}
                  rows={3}
                  style={{ width: "100%", background: "#1a1d2d", border: "1px solid #7c3aed", borderRadius: 6, color: "#10b981", padding: "10px 14px", fontSize: 12, fontFamily: "monospace", resize: "vertical", outline: "none" }}
                />
              </div>
            ) : (
              <>
                {/* Code block */}
                <div style={{ margin: "14px", borderRadius: 8, border: "1px solid #2e354f", overflow: "hidden" }}>
                  <div
                    style={{
                      background: "#1a1d2d",
                      padding: "8px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 11, color: "#828da9", fontFamily: "monospace", fontWeight: 600 }}>{language}</span>
                    <button
                      onClick={() => handleCopy(section.code, index)}
                      style={{ fontSize: 11, color: copiedIndex === index ? "#c3e88d" : "#828da9", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                    >
                      {copiedIndex === index ? "✓ Copied!" : (
                        <>
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <SyntaxHighlighter
                    language={language === "c" ? "c" : "python"}
                    style={tokyoNight as any}
                    showLineNumbers
                    lineNumberStyle={{
                      color: "#4f5b70",
                      fontSize: "11px",
                      paddingRight: "16px",
                      minWidth: "32px",
                      textAlign: "right",
                    }}
                    customStyle={{
                      margin: 0,
                      borderRadius: 0,
                      fontSize: "12px",
                      lineHeight: "1.5",
                      background: "#1a1d2d",
                      padding: "4px 0 14px 0",
                      overflow: "visible",
                      maxHeight: "none",
                    }}
                    codeTagProps={{
                      style: {
                        fontFamily: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
                      },
                    }}
                    wrapLines
                    wrapLongLines
                  >
                    {section.code}
                  </SyntaxHighlighter>
                </div>

                {/* Output */}
                {section.output && (
                  <div style={{ margin: "0 14px 14px 14px", borderRadius: 8, border: "1px solid #2e354f", overflow: "hidden" }}>
                    <div
                      style={{
                        background: "#1a1d2d",
                        borderBottom: "1px solid #2e354f",
                        padding: "8px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#10b981", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace" }}>
                        Output
                      </span>
                    </div>
                    <pre
                      style={{
                        background: "#0f111a",
                        color: "#10b981",
                        fontFamily: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
                        fontSize: "12px",
                        lineHeight: "1.5",
                        padding: "14px",
                        margin: 0,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {section.output}
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {/* Footer */}
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #2e354f", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "#4f5b70", fontFamily: "monospace" }}>CodeDoc</span>
          <span style={{ fontSize: 11, color: "#4f5b70", fontFamily: "monospace" }}>{new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}