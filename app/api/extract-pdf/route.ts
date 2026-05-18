import { NextRequest, NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { base64, filename } = body;

        if (!base64) {
            return NextResponse.json(
                { error: "No PDF data provided" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(base64, "base64");
        const uint8 = new Uint8Array(buffer);

        try {
            const pdf = await getDocumentProxy(uint8, {
                // Suppress non-fatal color space warnings
                verbosity: 0,
            });

            if (pdf.numPages > 50) {
                return NextResponse.json(
                    { error: "PDF has too many pages (max 50)." },
                    { status: 400 }
                );
            }

            const { text } = await extractText(pdf, { mergePages: true });

            const cleanText = (Array.isArray(text) ? text.join("\n") : text)
                .replace(/\u0000/g, "")
                .replace(/\n\s*\n/g, "\n\n")
                .trim();

            if (!cleanText) {
                return NextResponse.json(
                    { error: "The PDF appears to be empty or image-based (no selectable text found)." },
                    { status: 422 }
                );
            }

            return NextResponse.json({
                text: cleanText,
                pages: pdf.numPages,
                filename: filename || "document.pdf",
            });

        } catch (parseError: any) {
            console.error("[extract-pdf] parsing error:", parseError);
            return NextResponse.json(
                { error: "The PDF file is corrupted or could not be read." },
                { status: 422 }
            );
        }
    } catch (err) {
        console.error("[/api/extract-pdf] unhandled error:", err);
        return NextResponse.json(
            { error: "An error occurred during PDF processing." },
            { status: 500 }
        );
    }
}