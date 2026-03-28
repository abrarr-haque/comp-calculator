import { getThemeColors } from '../hooks/useTheme';

/** Dynamic colors that read from CSS custom properties — adapts to light/dark theme */
export function colors() {
  return getThemeColors();
}

// Re-export for convenience — call colors() in render to get current theme values
export { getThemeColors };
