import animate from "tailwindcss-animate"

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        brand: {
          navy: "#0A1628",
          blue: "#1A3A6B",
          bright: "#4A90D9",
          teal: "#00B4D8",
        },
        ink: {
          DEFAULT: "#0A1628",
          deep: "#060E1C",
          soft: "#0F1F38",
        },
        primary: {
          DEFAULT: "#1A3A6B",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#00B4D8",
          foreground: "#0A1628",
        },
        accent: {
          DEFAULT: "#4A90D9",
          foreground: "#FFFFFF",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        glow: "0 0 40px -12px rgba(0, 180, 216, 0.55)",
        "glow-lg": "0 0 80px -16px rgba(0, 180, 216, 0.65)",
        "inner-top": "inset 0 1px 0 0 rgba(255, 255, 255, 0.08)",
      },
      backgroundImage: {
        "grid-dark":
          "linear-gradient(to right, rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.055) 1px, transparent 1px)",
        "radial-fade":
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(26,58,107,0.55) 0%, rgba(10,22,40,0) 70%)",
        "accent-sheen":
          "linear-gradient(90deg, rgba(0,180,216,0) 0%, rgba(0,180,216,0.65) 50%, rgba(0,180,216,0) 100%)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-26px)" },
        },
        "pulse-ring": {
          "0%": { opacity: "0.55", transform: "scale(0.9)" },
          "70%": { opacity: "0", transform: "scale(1.4)" },
          "100%": { opacity: "0", transform: "scale(1.4)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(400%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 9s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.8s ease-out infinite",
        shimmer: "shimmer 2.6s ease-in-out infinite",
        scan: "scan 3.2s ease-in-out infinite",
      },
    },
  },
  plugins: [animate],
}
