"use client";

import { useState } from "react";
import { exportElementToPdf } from "../lib/exportPdf";
import type { CodeSection } from "../api/generate/route";

interface PdfExportButtonProps {
  question: string;
  sections: CodeSection[];
  language: string;
  disabled?: boolean;
}

export default function PdfExportButton({
  question,
  sections,
  language,
  disabled,
}: PdfExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    if (!sections.length) return;
    setIsExporting(true);
    setError(null);

    try {
      const safeFilename = question
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .slice(0, 40);

      await exportElementToPdf({
        question,
        sections,
        language,
        filename: `code-${safeFilename}`,
      });
    } catch (err) {
      console.error("PDF export failed:", err);
      setError("PDF export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleExport}
        disabled={disabled || isExporting}
        className="group w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm tracking-wide bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white transition-all duration-200"
      >
        {isExporting ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Preparing PDF…
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
    </div>
  );
}