import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        jakarta: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        manrope: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      colors: {
        primary: "var(--primary)",
        "primary-container": "var(--primary-container)",
        "on-primary": "var(--on-primary)",
        "primary-fixed": "var(--primary-fixed)",
        secondary: "var(--secondary)",
        "secondary-container": "var(--secondary-container)",
        tertiary: "var(--tertiary)",
        "tertiary-container": "var(--tertiary-container)",
        surface: "var(--surface)",
        "surface-lowest": "var(--surface-container-lowest)",
        "surface-low": "var(--surface-container-low)",
        "surface-mid": "var(--surface-container)",
        "surface-high": "var(--surface-container-high)",
        "surface-highest": "var(--surface-container-highest)",
        "on-surface": "var(--on-surface)",
        "on-surface-variant": "var(--on-surface-variant)",
        "outline-variant": "var(--outline-variant)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "3rem",
      },
      boxShadow: {
        ambient: "0 20px 40px rgba(45, 47, 49, 0.06)",
        float: "0 8px 32px rgba(45, 47, 49, 0.08)",
        "pink-glow": "0 8px 24px rgba(183, 0, 77, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
