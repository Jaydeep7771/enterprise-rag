import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "onyx": {
          900: "#09090b", // Deepest background
          800: "#121214", // Surface
          700: "#18181b", // Elevated surface
          600: "#27272a", // Borders
          500: "#3f3f46", // Muted text
          400: "#71717a", // Secondary text
          300: "#a1a1aa",
          200: "#d4d4d8",
          100: "#f4f4f5", // Primary text
          50: "#fafafa",
        },
        "champagne": {
          DEFAULT: "#eab308", // Golden accent
          glow: "rgba(234, 179, 8, 0.15)",
        }
      },
      boxShadow: {
        "glass": "0 4px 30px rgba(0, 0, 0, 0.1)",
        "glass-elevated": "0 10px 40px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      },
      animation: {
        "fade-in": "fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-up": "slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "bounce-dot": "bounce 1s infinite",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(234, 179, 8, 0)" },
          "50%":      { boxShadow: "0 0 20px 4px rgba(234, 179, 8, 0.1)" },
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
