import type { PaletteMode, ThemeOptions } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// Material Design 2 palette built around a Zambian-green brand accent, with
// the standard MD2 gray/amber/red/teal ramps used across the MUI dashboard
// template (status chips, charts, hover states). Mirrors the simplified
// theme approach used by the sibling *-main-admin dashboards this project
// follows.

export const brand = {
  50: '#e9f7ee',
  100: '#c3ecd2',
  200: '#8fd9ab',
  300: '#57bf80',
  400: '#2f9f5e',
  main: '#1a7a3c',
  500: '#1a7a3c',
  600: '#156332',
  700: '#114f28',
  800: '#0c3a1e',
  900: '#082613',
};

export const gray = {
  50: '#fafafa',
  100: '#f4f5f7',
  200: '#e6e8ec',
  300: '#d3d7de',
  400: '#a9afbc',
  500: '#7c8494',
  600: '#5a6272',
  700: '#3d4451',
  800: '#252a33',
  900: '#14171c',
};

export const green = { main: '#2e7d32', light: '#4caf50', dark: '#1b5e20', bg: '#e8f5e9' };
export const orange = { main: '#ed6c02', light: '#ff9800', dark: '#c65a00', bg: '#fff3e0' };
export const red = { main: '#d32f2f', light: '#ef5350', dark: '#b71c1c', bg: '#fdecea' };
export const teal = { main: '#00695c', light: '#26a69a', dark: '#004d40', bg: '#e0f2f1' };

export function getDesignTokens(mode: PaletteMode): ThemeOptions {
  return {
    palette: {
      mode,
      primary: {
        main: brand.main,
        light: brand[300],
        dark: brand[700],
        contrastText: '#fff',
      },
      secondary: {
        main: orange.main,
        contrastText: '#fff',
      },
      success: { main: green.main, light: green.light, dark: green.dark },
      warning: { main: orange.main, light: orange.light, dark: orange.dark },
      error: { main: red.main, light: red.light, dark: red.dark },
      info: { main: teal.main },
      divider: mode === 'dark' ? alpha(gray[600], 0.4) : gray[200],
      background:
        mode === 'dark'
          ? { default: '#0e1117', paper: '#161a21' }
          : { default: gray[50], paper: '#ffffff' },
      text:
        mode === 'dark'
          ? { primary: '#f4f5f7', secondary: gray[400] }
          : { primary: gray[900], secondary: gray[600] },
    },
    typography: {
      fontFamily: [
        '"JetBrains Mono"',
        'ui-monospace',
        '"SF Mono"',
        'Menlo',
        'Consolas',
        'monospace',
      ].join(','),
      h1: { fontSize: '2.25rem', fontWeight: 600, lineHeight: 1.2 },
      h2: { fontSize: '1.875rem', fontWeight: 600, lineHeight: 1.2 },
      h3: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.3 },
      h4: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.35 },
      h5: { fontSize: '1.0625rem', fontWeight: 600 },
      h6: { fontSize: '0.95rem', fontWeight: 600 },
      subtitle1: { fontSize: '0.925rem', fontWeight: 500 },
      subtitle2: { fontSize: '0.8125rem', fontWeight: 500 },
      body1: { fontSize: '0.925rem' },
      body2: { fontSize: '0.825rem' },
      caption: { fontSize: '0.75rem' },
    },
    shape: { borderRadius: 10 },
    spacing: 8,
  };
}
