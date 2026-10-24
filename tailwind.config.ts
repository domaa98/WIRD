import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#176B50",
          hover: "#145c45",
          light: "#eaf4f0",
          dark: "#0f4735",
        },
        deepGreen: {
          DEFAULT: "#183C31",
          hover: "#122f27",
          dark: "#0b1b16",
        },
        ivory: {
          DEFAULT: "#F8F7F1",
          dark: "#f0ede0",
        },
        gold: {
          DEFAULT: "#B99A58",
          light: "#d5bc82",
          dark: "#8f743c",
        },
        wirdMuted: "#718078",
        wirdBorder: "#E4E8DF",
        wirdDarkBg: "#0C1814",
        wirdDarkSurface: "#142822",
        wirdDarkBorder: "#1E3B32",
      },
      fontFamily: {
        arabic: ["var(--font-ibm-arabic)", "system-ui", "sans-serif"],
        quran: ["var(--font-amiri-quran)", "var(--font-amiri)", "Amiri", "Traditional Arabic", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
