import React from 'react';
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

export default function KpiCards({ activeInterface, themeMode }: KpiCardsProps) {
  const rx = activeInterface?.traffic?.total?.rx || 0;
  const tx = activeInterface?.traffic?.total?.tx || 0;
  const total = rx + tx;

  const isDark = themeMode === 'dark';

  const cardStyle = (lightBg: string, darkBg: string, neonColor: string) => ({
    borderRadius: '16px',
    boxShadow: 'none',
    // В тёмной теме убираем белый фон, делая глубокий темно-серый градиент
    background: isDark 
      ? `linear-gradient(135deg, #1e293b 0%, ${darkBg} 100%)` 
      : `linear-gradient(135deg, #ffffff 0%, ${lightBg} 100%)`,
    borderColor: isDark ? `rgba(${neonColor}, 0.2)` : '#e2e8f0',
    borderWidth: '1px',
    borderStyle: 'solid',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: isDark 
        ? `0 10px 25px rgba(${neonColor}, 0.15)` 
        : '0 10px 25px rgba(0,0,0,0.03)',
    },
  });

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {/* Карточка RX (Входящий) */}
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={cardStyle('#f0fdfa', '#0f2d2b', '0, 242, 254')}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: isDark ? 'rgba(0, 242, 254, 0.15)' : 'rgba(0, 242, 254, 0.1)', color: '#00f2fe', display: 'flex' }}>
              <ArrowDownwardIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Скачано (RX)</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: isDark ? '#e2e8f0' : '#0f172a', mt: 0.5 }}>
                {valueToHumanable(rx)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Карточка TX (Исходящий) */}
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={cardStyle('#faf5ff', '#2d124d', '157, 78, 221')}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: isDark ? 'rgba(157, 78, 221, 0.15)' : 'rgba(157, 78, 221, 0.1)', color: '#9d4edd', display: 'flex' }}>
              <ArrowUpwardIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Отдано (TX)</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: isDark ? '#e2e8f0' : '#0f172a', mt: 0.5 }}>
                {valueToHumanable(tx)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Общий трафик */}
      <Grid item xs={12} sm={12} md={4}>
        <Card sx={cardStyle('#f8fafc', '#111827', '100, 116, 139')}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(100, 116, 139, 0.1)', color: '#64748b', display: 'flex' }}>
              <StorageIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Всего прогнано</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: isDark ? '#e2e8f0' : '#0f172a', mt: 0.5 }}>
                {valueToHumanable(total)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
