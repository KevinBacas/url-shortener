import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";

const config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  prefix: "",
  theme: {
    extend: {},
  },
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            background: "#FFFFFF",
            foreground: "#11181C",
            primary: {
              DEFAULT: "#006FEE",
              foreground: "#ffffff",
            },
            secondary: {
              DEFAULT: "#9353D3",
              foreground: "#ffffff",
            },
          },
        },
        dark: {
          colors: {
            background: "#000000",
            foreground: "#ECEDEE",
            primary: {
              DEFAULT: "#006FEE",
              foreground: "#ffffff",
            },
            secondary: {
              DEFAULT: "#9353D3",
              foreground: "#ffffff",
            },
          },
        },
      },
    }),
  ],
} satisfies Config;

export default config;
