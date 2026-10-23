import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#090D16",
          900: "#0F172A", // Deep Navy Slate
          800: "#1E293B",
          700: "#334155",
        },
        emerald: {
          brand: "#10B981", // Electric Emerald / Growth Mint
          hover: "#059669",
          glow: "rgba(16, 185, 129, 0.25)",
        },
        amber: {
          brand: "#FACC15", // Signal Yellow / Vivid Amber
          hover: "#EAB308",
        },
      },
    },
  },
  plugins: [],
};

export default config;
