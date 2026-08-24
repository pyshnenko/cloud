// src/components/DashboardRoot.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider, CssBaseline, Box } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import DashboardContent from './DashboardContent';
import PixelPreloader from './PixelPreloader';

export type ThemeSetting = 'light' | 'dark' | 'auto';

export default function DashboardRoot() {
  // Хук MUI оставляем для отслеживания изменений системной темы "на лету"
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // 1. Синхронно и лениво читаем настройку из localStorage
  const [themeSetting, setThemeSetting] = useState<ThemeSetting>(() => {
    if (typeof window !== 'undefined') {
      const savedSetting = localStorage.getItem('dashboard-theme-setting') as ThemeSetting;
      if (savedSetting && ['light', 'dark', 'auto'].includes(savedSetting)) {
        return savedSetting;
      }
    }
    return 'auto';
  });

  // 2. Мгновенно вычисляем точный renderMode БЕЗ ожидания хуков React
  const [renderMode, setRenderMode] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedSetting = localStorage.getItem('dashboard-theme-setting') as ThemeSetting;
      if (savedSetting === 'light' || savedSetting === 'dark') {
        return savedSetting;
      }
      // Если "auto", проверяем системную тему нативным JS прямо сейчас
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark'; // Резерв для SSR (в нашем случае не сработает, так как ssr: false)
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Синхронизируем тему, если пользователь изменил настройки ОС во время работы дашборда
  useEffect(() => {
    if (themeSetting === 'auto') {
      setRenderMode(prefersDarkMode ? 'dark' : 'light');
    }
  }, [themeSetting, prefersDarkMode]);

  const changeThemeSetting = (newSetting: ThemeSetting) => {
    setThemeSetting(newSetting);
    setRenderMode(newSetting === 'auto' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : newSetting);
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
        // Передаем гарантированно правильный renderMode во второй прелоадер
        <PixelPreloader renderMode={renderMode} onComplete={() => setIsLoading(false)} />
      ) : (
        <Box sx={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
          {/* Неоновые сферы */}
          <Box sx={{ position: 'fixed', width: 450, height: 450, borderRadius: '50%', background: renderMode === 'dark' ? 'radial-gradient(circle, rgba(0,242,254,0.12) 0%, rgba(0,0,0,0) 70%)' : 'radial-gradient(circle, rgba(79,172,254,0.08) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(50px)', top: '-10%', left: '-5%', zIndex: 0, animation: 'floatBlob 22s ease-in-out infinite', willChange: 'transform' }} />
          <Box sx={{ position: 'fixed', width: 500, height: 500, borderRadius: '50%', background: renderMode === 'dark' ? 'radial-gradient(circle, rgba(157,78,221,0.1) 0%, rgba(0,0,0,0) 70%)' : 'radial-gradient(circle, rgba(157,78,221,0.05) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', bottom: '10%', right: '-10%', zIndex: 0, animation: 'floatBlob2 28s ease-in-out infinite alternate', willChange: 'transform' }} />
          
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
