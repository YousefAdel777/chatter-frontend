/* eslint-disable @typescript-eslint/no-require-imports */
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  jit: true,
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background))",
        "background-secondary": "rgb(var(--background-secondary))",
        "background-ternary": "rgb(var(--background-ternary))",
        "border-primary": "rgb(var(--border-border-primary))",
        primary: "rgb(var(--color-primary))",
        secondary: "rgb(var(--color-secondary))",
        error: "rgb(var(--color-error))",
        base: "rgb(var(--text-base))",
        muted: "rgb(var(--text-muted))",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
} satisfies Config;
