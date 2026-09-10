import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#08090C",
        "bb-black": "#08090C",
        "bb-surface": "#101116",
        "bb-card": "#15161D",
        "bb-card-hover": "#1B1D25",
        "bb-border": "rgba(255, 255, 255, 0.08)",
        "bb-border-strong": "rgba(255, 255, 255, 0.16)",
        surface: {
          DEFAULT: "#101116",
          light: "#16171E",
          card: "#15161D",
        },
        "team-red": {
          DEFAULT: "#E50914",
          dark: "#99060E",
          surface: "rgba(229, 9, 20, 0.08)",
          border: "rgba(229, 9, 20, 0.35)",
        },
        "team-blue": {
          DEFAULT: "#0066FF",
          dark: "#0044AA",
          surface: "rgba(0, 102, 255, 0.08)",
          border: "rgba(0, 102, 255, 0.35)",
        },
        "bb-gold": {
          DEFAULT: "#D4AF37",
          dark: "#997D22",
          surface: "rgba(212, 175, 55, 0.08)",
          border: "rgba(212, 175, 55, 0.35)",
        },
        zinc: {
          850: "#1D1E24",
          950: "#0B0C0F",
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['"Bebas Neue"', '"Barlow Condensed"', 'Impact', 'sans-serif'],
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight: "-0.02em",
        wide: "0.04em",
        wider: "0.08em",
        widest: "0.14em",
      },
    },
  },
  plugins: [],
};

export default config;
