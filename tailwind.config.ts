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
        primary: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          DEFAULT: "#7c3aed",
        },
        secondary: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          DEFAULT: "#0d9488",
        },
        accent: {
          500: "#f97316",
          600: "#ea580c",
          DEFAULT: "#f97316",
        },
        warning: {
          400: "#fbbf24",
          500: "#f59e0b",
          DEFAULT: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-noto-arabic)", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      keyframes: {
        'wave': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
        'float-1': {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-50px) translateX(30px) rotate(10deg)' },
          '66%': { transform: 'translateY(-20px) translateX(-20px) rotate(-5deg)' },
        },
        'float-2': {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(40px) translateX(-30px) rotate(-10deg)' },
          '66%': { transform: 'translateY(-60px) translateX(25px) rotate(15deg)' },
        },
        'float-3': {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px) scale(1) rotate(0deg)' },
          '33%': { transform: 'translateY(-40px) translateX(-25px) scale(1.1) rotate(-15deg)' },
          '66%': { transform: 'translateY(30px) translateX(20px) scale(0.9) rotate(20deg)' },
        },
        'float-capsule': {
          '0%, 100%': { transform: 'translateY(0px) rotate(15deg)' },
          '33%': { transform: 'translateY(-70px) translateX(20px) rotate(30deg)' },
          '66%': { transform: 'translateY(-30px) translateX(-30px) rotate(0deg)' },
        },
        'float-shell': {
          '0%, 100%': { transform: 'translateY(0px) rotateX(20deg) rotateY(-15deg)' },
          '33%': { transform: 'translateY(-60px) rotateX(30deg) rotateY(0deg) scale(1.05)' },
          '66%': { transform: 'translateY(-20px) rotateX(10deg) rotateY(-25deg) scale(0.95)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-scale': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      },
      animation: {
        'wave-slowest': 'wave 25s ease-in-out infinite',
        'wave-slow': 'wave 18s ease-in-out infinite',
        'wave-medium': 'wave 12s ease-in-out infinite',
        'float-1': 'float-1 8s ease-in-out infinite',
        'float-2': 'float-2 11s ease-in-out infinite',
        'float-3': 'float-3 6s ease-in-out infinite',
        'float-capsule': 'float-capsule 9s ease-in-out infinite',
        'float-shell': 'float-shell 12s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'fade-in-scale': 'fade-in-scale 0.7s ease-out forwards',
      }
    },
  },
  plugins: [],
};

export default config;
