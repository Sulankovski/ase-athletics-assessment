/**
 * Runtime access to the same tokens as Tailwind (from ui_guidelines.json).
 * Use for charts (e.g. Recharts color array), theme switching, or Storybook.
 */
import guidelines from './ui_guidelines.json';

export const designTokens = guidelines;
export const chartColors = guidelines.charts?.colors ?? [];
export const breakpoints = guidelines.responsiveBreakpoints;

export default guidelines;
