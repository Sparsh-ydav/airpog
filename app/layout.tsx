import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { JetBrains_Mono } from "next/font/google";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
export const metadata: Metadata = {
  title: "CodeDoc AI — AI Code Answers to PDF",
  description:
    "Ask programming questions, get AI-generated answers with syntax highlighting, and export beautiful PDFs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
