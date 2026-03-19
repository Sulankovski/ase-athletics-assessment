/**
 * Builds Tailwind `theme.extend` from `ui_guidelines.json` so design tokens
 * stay in one place for the whole app.
 */
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const guidelines = require('./ui_guidelines.json');

/** @param {string} csv */
function fontFamilyTokens(csv) {
  return csv.split(',').map((s) => s.trim());
}

/** @type {import('tailwindcss').Config['theme']['extend']} */
export function getTailwindThemeExtend() {
  const { colorPalette, typography, spacing, borderRadius, shadows, responsiveBreakpoints } =
    guidelines;

  return {
    colors: {
      primary: colorPalette.primary,
      secondary: colorPalette.secondary,
      accent: colorPalette.accent,
      neutral: colorPalette.neutral,
    },
    fontFamily: {
      primary: fontFamilyTokens(typography.fontFamily.primary),
      secondary: fontFamilyTokens(typography.fontFamily.secondary),
      monospace: fontFamilyTokens(typography.fontFamily.monospace),
    },
    fontSize: typography.fontSize,
    fontWeight: typography.fontWeight,
    lineHeight: typography.lineHeight,
    spacing,
    borderRadius,
    boxShadow: shadows,
    screens: responsiveBreakpoints,
  };
}
