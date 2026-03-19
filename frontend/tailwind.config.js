import { getTailwindThemeExtend } from './src/styles/tailwindThemeFromGuidelines.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: getTailwindThemeExtend(),
  },
  plugins: [],
};
