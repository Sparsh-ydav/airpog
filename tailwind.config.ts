import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        // Ensure these CSS variables are defined in your globals.css
        mono: ["var(--font-mono)", "JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.3s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      colors: {
        slate: {
          925: "#0b1120",
          950: "#030712",
        },
      },
    },
  },
  plugins: [],
};

export default config;