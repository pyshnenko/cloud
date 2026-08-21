// components/DashboardRoot.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider, CssBaseline, Box } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import DashboardContent from './DashboardContent';
import PixelPreloader from './PixelPreloader';

export type ThemeSetting = 'light' | 'dark' | 'auto';

export default function DashboardRoot() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [themeSetting, setThemeSetting] = useState<ThemeSetting>('auto');
  const [renderMode, setRenderMode] = useState<'light' | 'dark'>('dark');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Так как это чистый CSR, код выполнится мгновенно в браузере
  useEffect(() => {
    const savedSetting = localStorage.getItem('dashboard-theme-setting') as ThemeSetting;
    if (savedSetting && ['light', 'dark', 'auto'].includes(savedSetting)) {
      setThemeSetting(savedSetting);
    }
  }, []);

  useEffect(() => {
    setRenderMode(themeSetting === 'auto' ? (prefersDarkMode ? 'dark' : 'light') : themeSetting);
  }, [themeSetting, prefersDarkMode]);

  const changeThemeSetting = (newSetting: ThemeSetting) => {
    setThemeSetting(newSetting);
    localStorage.setItem('dashboard-theme-setting', newSetting);
  };

  const theme = useMemo(() => createTheme({
    palette: {
      mode: renderMode,
      primary: { main: '#4facfe' },
      background: {
        default: renderMode === 'dark' ? '#0f172a' : '#f8fafc',
        paper: renderMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.75)',
      },
    },
    shape: { borderRadius: 16 },
  }), [renderMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {isLoading ? (
        <PixelPreloader renderMode={renderMode} onComplete={() => setIsLoading(false)} />
      ) : (
        <Box sx={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
          {/* Неоновые сферы */}
          <Box sx={{ position: 'fixed', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,242,254,0.12) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(50px)', top: '-10%', left: '-5%', zIndex: 0, animation: 'floatBlob 22s ease-in-out infinite', willChange: 'transform' }} />
          <Box sx={{ position: 'fixed', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(157,78,221,0.1) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', bottom: '10%', right: '-10%', zIndex: 0, animation: 'floatBlob2 28s ease-in-out infinite alternate', willChange: 'transform' }} />
          
          <style>{`
            @keyframes floatBlob {
              0% { transform: translate3d(0, 0, 0) scale(1); }
              50% { transform: translate3d(80px, 60px, 0) scale(1.1); }
              100% { transform: translate3d(0, 0, 0) scale(1); }
            }
            @keyframes floatBlob2 {
              0% { transform: translate3d(0, 0, 0) scale(1.1); }
              50% { transform: translate3d(-100px, -40px, 0) scale(0.9); }
              100% { transform: translate3d(0, 0, 0) scale(1.1); }
            }
          `}</style>

          <Box sx={{ position: 'relative', zIndex: 1, animation: 'fadeInSite 1s cubic-bezier(0.25, 1, 0.5, 1) forwards', '@keyframes fadeInSite': { '0%': { opacity: 0, transform: 'scale(0.99)' }, '100%': { opacity: 1, transform: 'scale(1)' } } }}>
            <DashboardContent renderMode={renderMode} themeSetting={themeSetting} setThemeSetting={changeThemeSetting} />
          </Box>
        </Box>
      )}
    </ThemeProvider>
  );
}
