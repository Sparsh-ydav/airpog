import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in .env.local");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface GenerateRequest {
  question: string;
  language: "python" | "c";
  pdfText?: string;
  pdfFilename?: string;
}

export interface CodeSection {
  title: string;
  description: string;
  code: string;
  output: string;
}

export interface GenerateResponse {
  sections: CodeSection[];
  language: string;
  summary: string;
}

export interface GenerateError {
  error: string;
  code: string;
}

export async function POST(req: NextRequest) {
  try {
    let body: GenerateRequest;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json<GenerateError>(
        { error: "Invalid JSON in request body", code: "INVALID_JSON" },
        { status: 400 }
      );
    }

    const { question, language, pdfText, pdfFilename } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json<GenerateError>(
        { error: "Question is required", code: "MISSING_QUESTION" },
        { status: 400 }
      );
    }
    if (question.trim().length < 10) {
      return NextResponse.json<GenerateError>(
        { error: "Question is too short.", code: "QUESTION_TOO_SHORT" },
        { status: 400 }
      );
    }
    if (question.trim().length > 2000) {
      return NextResponse.json<GenerateError>(
        { error: "Question exceeds 2000 character limit.", code: "QUESTION_TOO_LONG" },
        { status: 400 }
      );
    }

    const langLabel = language === "c"
      ? "C (not C++), using C99/C11 standard"
      : "Python 3";

    // Find your systemPrompt and add this rule:
    const systemPrompt = `You are an expert software engineer and technical educator.
When given a programming question, respond ONLY with a valid JSON object — no markdown, no backticks, no explanation outside the JSON.

The JSON must follow this exact structure:
{
  "summary": "A 1-2 sentence overview of the solution approach.",
  "sections": [
    {
      "title": "Short section title",
      "description": "1-2 sentences explaining what this section does.",
      "code": "The complete runnable code as a plain string. Use \\n for newlines. Do NOT double any characters — single # for preprocessor, single ; for statements, single brackets.",
      "output": "ONLY the raw stdout output when the code runs. No question text, no prompts, no explanation."
    }
  ]
}

CRITICAL RULES:
- Write all code in ${langLabel}.
- NEVER double characters. Use single #, single ;, single [], single () everywhere in the code string.
- The code field must contain valid, compilable source code with correct syntax.
- The output field must contain ONLY what the program prints to stdout — nothing else.
- Return ONLY the raw JSON object. No markdown fences, no text before or after.`;

    const hasPdf = pdfText && pdfText.trim().length > 0;
    const truncatedPdf = hasPdf ? pdfText!.slice(0, 40_000) : null;

    const userPrompt = hasPdf
      ? `The user has uploaded a PDF named "${pdfFilename ?? "document.pdf"}".\n\nPDF CONTENT:\n---\n${truncatedPdf}\n---\n\nBased on the PDF, answer this question:\n${question.trim()}`
      : `Programming Question: ${question.trim()}`;

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
      systemInstruction: systemPrompt,
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000);

    let result: Awaited<ReturnType<typeof model.generateContent>>;
    try {
      result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      });
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === "AbortError") {
        return NextResponse.json<GenerateError>(
          { error: "Request timed out. Please try again.", code: "TIMEOUT" },
          { status: 504 }
        );
      }
      throw err;
    }
    clearTimeout(timeoutId);

    const raw = result.response.text().trim();

    // Strip markdown code fences if Gemini wraps the JSON anyway
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    let parsed: GenerateResponse;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json<GenerateError>(
        { error: "AI returned malformed JSON. Please try again.", code: "PARSE_ERROR" },
        { status: 500 }
      );
    }

    if (!parsed.sections || !Array.isArray(parsed.sections)) {
      return NextResponse.json<GenerateError>(
        { error: "AI response missing sections array.", code: "INVALID_STRUCTURE" },
        { status: 500 }
      );
    }

    return NextResponse.json<GenerateResponse>({
      sections: parsed.sections,
      summary: parsed.summary ?? "",
      language: language === "c" ? "c" : "python",
    });

  } catch (error: unknown) {
    console.error("[/api/generate] Unhandled error:", error);
    return NextResponse.json<GenerateError>(
      { error: "An unexpected server error occurred.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST." },
    { status: 405 }
  );
}