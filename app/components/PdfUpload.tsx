"use client";

import { useRef, useState } from "react";

interface PdfUploadProps {
    onExtracted: (text: string, filename: string) => void;
    disabled?: boolean;
}

export default function PdfUpload({ onExtracted, disabled }: PdfUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filename, setFilename] = useState<string | null>(null);

    async function processFile(file: File) {
        if (file.type !== "application/pdf") {
            setError("Only PDF files are supported.");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError("PDF must be under 10 MB.");
            return;
        }

        setError(null);
        setIsProcessing(true);
        setFilename(file.name);

        try {
            // Read file as base64 and send to our extraction endpoint
            const arrayBuffer = await file.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString("base64");

            const res = await fetch("/api/extract-pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ base64, filename: file.name }),
            });

            const data = await res.json();
            if (!res.ok || data.error) {
                throw new Error(data.error ?? "Extraction failed");
            }

            onExtracted(data.text, file.name);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to read PDF.");
            setFilename(null);
        } finally {
            setIsProcessing(false);
        }
    }

    function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    }

    function handleClear() {
        setFilename(null);
        setError(null);
        if (inputRef.current) inputRef.current.value = "";
        onExtracted("", "");
    }

    return (
        <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Upload PDF (optional)
            </label>

            {!filename ? (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => !disabled && inputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 cursor-pointer transition-all duration-200
            ${isDragging ? "border-violet-500 bg-violet-500/10" : "border-slate-600 hover:border-slate-500 hover:bg-slate-800/50"}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept="application/pdf"
                        className="sr-only"
                        onChange={handleFileInput}
                        disabled={disabled}
                    />
                    {isProcessing ? (
                        <>
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-violet-500" />
                            <span className="text-xs text-slate-400">Reading PDF…</span>
                        </>
                    ) : (
                        <>
                            <svg className="h-7 w-7 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                            <span className="text-xs text-slate-400 text-center">
                                Drop a PDF here or <span className="text-violet-400 underline">browse</span>
                            </span>
                            <span className="text-xs text-slate-600">Max 10 MB</span>
                        </>
                    )}
                </div>
            ) : (
                <div className="flex items-center gap-3 rounded-xl bg-violet-500/10 border border-violet-500/30 px-4 py-3">
                    <svg className="h-5 w-5 text-violet-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                    <span className="text-xs text-violet-300 truncate flex-1 font-mono">{filename}</span>
                    <button onClick={handleClear} className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {error && (
                <p className="text-xs text-red-400">{error}</p>
            )}
        </div>
    );
}