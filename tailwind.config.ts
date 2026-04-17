import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ["var(--font-bitter)", "Georgia", "serif"],
        sans: ["var(--font-ui)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      colors: {
        /* Aligned with public/styles.css — cream, olive, forest */
        admin: {
          bg: "#f4f1ea",
          surface: "#faf8f2",
          surfaceMuted: "#f0ede5",
          head: "#e8e6df",
          border: "#cfc9bc",
          accent: "#65754a",
          accentDeep: "#4f5c38",
          muted: "#5a5852",
          ink: "#1e1e1c",
        },
      },
      boxShadow: {
        card: "0 4px 24px rgba(45, 51, 34, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
