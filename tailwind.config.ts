import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Government brand
        navy: {
          DEFAULT: "#0b2545",
          50: "#eef2f8",
          100: "#d6e0ef",
          600: "#13315c",
          700: "#0b2545",
          800: "#081a33",
          900: "#050f1f",
        },
        crimson: "#dc143c", // Nepal flag red
        // Tier accents
        ward: { DEFAULT: "#15803d", light: "#dcfce7" }, // green
        municipality: { DEFAULT: "#c2410c", light: "#ffedd5" }, // orange
        province: { DEFAULT: "#1d4ed8", light: "#dbeafe" }, // blue
        central: { DEFAULT: "#b91c1c", light: "#fee2e2" }, // red
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
