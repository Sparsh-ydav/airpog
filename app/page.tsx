"use client";

import { useState } from "react";
import QuestionForm from "./components/QuestionForm";
import CodePreview from "./components/CodePreview";
import SkeletonLoader from "./components/SkeletonLoader";
import PdfExportButton from "./components/PdfExportButton";
import PdfUpload from "./components/PdfUpload";
import type { CodeSection, GenerateResponse, GenerateError } from "./api/generate/route";

interface AppState {
  question: string;
  summary: string;
  sections: CodeSection[];
  language: string;
  status: "idle" | "loading" | "success" | "error";
  errorMessage: string | null;
}

const INITIAL_STATE: AppState = {
  question: "",
  summary: "",
  sections: [],
  language: "c",
  status: "idle",
  errorMessage: null,
};

export default function Home() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [pdfText, setPdfText] = useState("");
  const [pdfFilename, setPdfFilename] = useState("");

  async function handleGenerate(
    question: string,
    language: "python" | "c",
    pdfText?: string,
    pdfFilename?: string
  ) {
    setState((prev) => ({
      ...prev,
      question,
      language,
      status: "loading",
      errorMessage: null,
      sections: [],
      summary: "",
    }));

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, language, pdfText, pdfFilename }),
      });

      const data: GenerateResponse | GenerateError = await res.json();

      if (!res.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "Unknown error");
      }

      setState((prev) => ({
        ...prev,
        summary: data.summary,
        sections: data.sections,
        language: data.language,
        status: "success",
      }));
    } catch (err: unknown) {
      setState((prev) => ({
        ...prev,
        status: "error",
        errorMessage:
          err instanceof Error ? err.message : "Failed to generate answer.",
      }));
    }
  }

  const isLoading = state.status === "loading";
  const hasResult = state.status === "success" && state.sections.length > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">CodeDoc AI</h1>
              <p className="text-xs text-slate-500">AI answers → Beautiful PDFs</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-500">Connected</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left panel */}
          <aside className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Ask a Question</h2>
              <p className="text-sm text-slate-400">
                Get a structured, section-by-section solution with outputs you can export to PDF.
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 space-y-5">
              <PdfUpload
                onExtracted={(text, name) => {
                  setPdfText(text);
                  setPdfFilename(name);
                }}
                disabled={isLoading}
              />
              <QuestionForm
                onSubmit={handleGenerate}
                isLoading={isLoading}
                pdfText={pdfText}
                pdfFilename={pdfFilename}
              />
            </div>

            {state.status === "error" && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 flex gap-3">
                <svg className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-red-400">Generation Failed</p>
                  <p className="text-xs text-red-300/80 mt-0.5">{state.errorMessage}</p>
                </div>
              </div>
            )}

            {hasResult && (
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-white">Export</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Downloads all sections and outputs as a single formatted PDF.
                  </p>
                </div>
                <PdfExportButton
                  question={state.question}
                  sections={state.sections}
                  language={state.language}
                  disabled={isLoading}
                />
              </div>
            )}
          </aside>

          {/* Right panel */}
          <section className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Preview</h2>
              {hasResult && (
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">
                  {state.sections.length} section{state.sections.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {state.status === "idle" && (
              <div className="rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/30 flex flex-col items-center justify-center py-24 px-8 text-center">
                <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <p className="text-slate-400 font-medium text-sm">Your answer will appear here</p>
                <p className="text-slate-600 text-xs mt-1">Each task will be shown as a separate section with its output</p>
              </div>
            )}

            {isLoading && <SkeletonLoader />}

            {hasResult && (
              <CodePreview
                question={state.question}
                summary={state.summary}
                sections={state.sections}
                language={state.language}
                onSectionsChange={(sections) =>
                  setState((prev) => ({ ...prev, sections }))
                }
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}