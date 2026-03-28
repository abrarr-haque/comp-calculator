import { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  resolved: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  resolved: 'light',
  setMode: () => {},
  toggle: () => {},
});

const STORAGE_KEY = 'comp-theme';

function getSystemPreference(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  return mode === 'system' ? getSystemPreference() : mode;
}

export function useThemeProvider() {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
    return 'light';
  });

  const resolved = resolveTheme(mode);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    localStorage.setItem(STORAGE_KEY, m);
  }, []);

  const toggle = useCallback(() => {
    setMode(resolved === 'light' ? 'dark' : 'light');
  }, [resolved, setMode]);

  // Apply .dark class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (resolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [resolved]);

  // Listen for system preference changes
  useEffect(() => {
    if (mode !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setModeState((prev) => (prev === 'system' ? 'system' : prev));
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [mode]);

  return { mode, resolved, setMode, toggle };
}

export function useTheme() {
  return useContext(ThemeContext);
}

export { ThemeContext };

/** Read computed CSS custom properties for use in Recharts (which needs raw hex strings) */
export function getThemeColors() {
  const style = getComputedStyle(document.documentElement);
  const get = (name: string) => style.getPropertyValue(name).trim();
  return {
    bg: get('--raw-bg'),
    surface: get('--raw-surface'),
    surface2: get('--raw-surface2'),
    surface3: get('--raw-surface3'),
    border: get('--raw-border'),
    text: get('--raw-text'),
    textSecondary: get('--raw-text-secondary'),
    muted: get('--raw-muted'),
    green: get('--raw-green'),
    red: get('--raw-red'),
    blue: get('--raw-blue'),
    orange: get('--raw-orange'),
    amber: get('--raw-amber'),
    indigo: get('--raw-indigo'),
    q1: get('--raw-q1'),
    q2: get('--raw-q2'),
    q3: get('--raw-q3'),
    net: get('--raw-net'),
    cadColor: get('--raw-cad'),
    usdColor: get('--raw-usd'),
    gold: get('--raw-gold'),
    accent: get('--raw-accent'),
  };
}
