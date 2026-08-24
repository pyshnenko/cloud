import React, { useEffect, useState, useRef } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import StorageIcon from '@mui/icons-material/Storage';
import { valueToHumanable } from '../utils/vnstatHelpers';

interface KpiCardsProps {
  activeInterface: any;
  themeMode: 'light' | 'dark';
}

interface StatCardProps {
  title: string;
  targetValue: number;
  lightBg: string;
  darkBg: string;
  neonColor: string;
  icon: React.ReactNode;
  themeMode: 'light' | 'dark';
}

// 🎰 ИСПРАВЛЕННЫЙ СЧЕТЧИК С ОЧИСТКОЙ КАДРОВ
function AnimatedValue({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const start = prevValueRef.current;
    const end = value;
    if (start === end) return;

    const duration = 800; // Длительность анимации в мс
    const startTime = performance.now();
    let animationFrameId: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Функция плавности EaseOutCubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easeProgress;
      
      // Не округляем через Math.floor, чтобы сохранить точность долей байта для утилиты
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        prevValueRef.current = end;
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    // 🌟 Защита от Race Condition: отменяем старый кадр, если прилетели новые данные
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value]);

  return <>{valueToHumanable(displayValue)}</>;
}

function StatCard({ title, targetValue, lightBg, darkBg, neonColor, icon, themeMode }: StatCardProps) {
  const isDark = themeMode === 'dark';

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: 'none',
          backdropFilter: 'blur(16px)',
          background: isDark
            ? `linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(${darkBg}, 0.5) 100%)`
            : `linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(${lightBg}, 0.6) 100%)`,
          borderColor: isDark ? `rgba(${neonColor}, 0.25)` : '#e2e8f0',
          borderWidth: '1px',
          borderStyle: 'solid',
          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: isDark ? `0 12px 30px rgba(${neonColor}, 0.25)` : '0 12px 30px rgba(0,0,0,0.04)',
          },
        }}
      >
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1.5, borderRadius: '12px', display: 'flex', bgcolor: isDark ? `rgba(${neonColor}, 0.2)` : `rgba(${neonColor}, 0.15)`, color: `rgb(${neonColor})` }}>
            {icon}
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: isDark ? '#e2e8f0' : '#0f172a', mt: 0.5 }}>
              <AnimatedValue value={targetValue} />
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
}

export default React.memo(function KpiCards({ activeInterface, themeMode }: KpiCardsProps) {
  const rx = activeInterface?.traffic?.total?.rx || 0;
  const tx = activeInterface?.traffic?.total?.tx || 0;
  const total = rx + tx;

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid container item spacing={3}>
        <StatCard title="Скачано (RX)" targetValue={rx} lightBg="240, 253, 250" darkBg="15, 45, 43" neonColor="0, 242, 254" icon={<ArrowDownwardIcon />} themeMode={themeMode} />
        <StatCard title="Отдано (TX)" targetValue={tx} lightBg="250, 245, 255" darkBg="45, 18, 77" neonColor="157, 78, 221" icon={<ArrowUpwardIcon />} themeMode={themeMode} />
        <StatCard title="Всего прогнано" targetValue={total} lightBg="248, 250, 252" darkBg="17, 24, 39" neonColor="100, 116, 139" icon={<StorageIcon />} themeMode={themeMode} />
      </Grid>
    </Grid>
  );
});
