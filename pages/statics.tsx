import React, { useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import DashboardContent from '../src/components/DashboardContent';

export default function DedansChartsWrapper() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setThemeMode(prefersDarkMode ? 'dark' : 'light');
  }, [prefersDarkMode]);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: themeMode,
      primary: { main: '#4facfe' },
      background: {
        default: themeMode === 'dark' ? '#0f172a' : '#f8fafc',
        paper: themeMode === 'dark' ? '#1e293b' : '#ffffff',
      },
    },
    shape: { borderRadius: 16 },
  }), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DashboardContent themeMode={themeMode} setThemeMode={setThemeMode} />
    </ThemeProvider>
  );
}
