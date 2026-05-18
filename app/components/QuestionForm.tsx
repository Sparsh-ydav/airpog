"use client";

import { useRef, type FormEvent } from "react";

interface QuestionFormProps {
  onSubmit: (
    question: string,
    language: "python" | "c",
    pdfText?: string,
    pdfFilename?: string
  ) => void;
  isLoading: boolean;
  pdfText?: string;
  pdfFilename?: string;
}

export default function QuestionForm({
  onSubmit,
  isLoading,
  pdfText,     // Added this
  pdfFilename, // Added this
}: QuestionFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const langRef = useRef<"python" | "c">("python");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const question = textareaRef.current?.value.trim() ?? "";

    if (!question || isLoading) return;

    // Removed "props." prefix as these are now destructured variables
    onSubmit(question, langRef.current, pdfText, pdfFilename);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Language toggle */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
          Language
        </label>
        <div className="flex rounded-lg overflow-hidden border border-slate-600 w-fit">
          {(["python", "c"] as const).map((lang) => (
            <label key={lang} className="relative cursor-pointer">
              <input
                type="radio"
                name="language"
                value={lang}
                defaultChecked={lang === "python"}
                onChange={() => {
                  langRef.current = lang;
                }}
                className="sr-only peer"
              />
              <span className="block px-5 py-2 text-sm font-mono font-medium text-slate-400 peer-checked:bg-violet-600 peer-checked:text-white transition-colors select-none">
                {lang === "python" ? "Python" : "C"}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Question textarea */}
      <div>
        <label
          htmlFor="question"
          className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2"
        >
          Question
        </label>
        <textarea
          id="question"
          ref={textareaRef}
          rows={5}
          maxLength={2000}
          disabled={isLoading}
          placeholder={
            pdfText
              ? "Ask a question about the uploaded PDF…"
              : "e.g. How do I implement a linked list?"
          }
          className="w-full rounded-xl bg-slate-800 border border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-slate-100 placeholder-slate-500 px-4 py-3 text-sm resize-none transition-all outline-none disabled:opacity-50 font-mono"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 text-white transition-colors"
      >
        {isLoading ? "Generating..." : "Generate Answer"}
      </button>
    </form>
  );
}