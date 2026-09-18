import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { componentCustomizations } from './customizations';
import { getDesignTokens } from './themePrimitives';

const theme = createTheme({
  colorSchemes: {
    light: { palette: getDesignTokens('light').palette },
    dark: { palette: getDesignTokens('dark').palette },
  },
  typography: getDesignTokens('light').typography,
  shape: getDesignTokens('light').shape,
  spacing: 8,
  components: componentCustomizations,
});

export default function AppTheme({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme} defaultMode="system" disableTransitionOnChange>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}
