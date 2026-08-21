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

interface StatCardProps {
  title: string;
  value: string | number;
  lightBg: string;
  darkBg: string;
  neonColor: string;
  icon: React.ReactNode;
  themeMode: 'light' | 'dark';
}

function StatCard({ title, value, lightBg, darkBg, neonColor, icon, themeMode }: StatCardProps) {
  const isDark = themeMode === 'dark';

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: 'none',
          background: isDark
            ? `linear-gradient(135deg, #1e293b 0%, ${darkBg} 100%)`
            : `linear-gradient(135deg, #ffffff 0%, ${lightBg} 100%)`,
          borderColor: isDark ? `rgba(${neonColor}, 0.2)` : '#e2e8f0',
          borderWidth: '1px',
          borderStyle: 'solid',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: isDark ? `0 10px 25px rgba(${neonColor}, 0.15)` : '0 10px 25px rgba(0,0,0,0.03)',
          },
        }}
      >
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1.5, borderRadius: '12px', display: 'flex', bgcolor: isDark ? `rgba(${neonColor}, 0.15)` : `rgba(${neonColor}, 0.1)`, color: `rgb(${neonColor})` }}>
            {icon}
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: isDark ? '#e2e8f0' : '#0f172a', mt: 0.5 }}>
              {valueToHumanable(value)}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
}

// Применяем мемоизацию к блоку карточек
export default React.memo(function KpiCards({ activeInterface, themeMode }: KpiCardsProps) {
  const rx = activeInterface?.traffic?.total?.rx || 0;
  const tx = activeInterface?.traffic?.total?.tx || 0;
  const total = rx + tx;

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <StatCard title="Скачано (RX)" value={rx} lightBg="#f0fdfa" darkBg="#0f2d2b" neonColor="0, 242, 254" icon={<ArrowDownwardIcon />} themeMode={themeMode} />
      <StatCard title="Отдано (TX)" value={tx} lightBg="#faf5ff" darkBg="#2d124d" neonColor="157, 78, 221" icon={<ArrowUpwardIcon />} themeMode={themeMode} />
      <StatCard title="Всего прогнано" value={total} lightBg="#f8fafc" darkBg="#111827" neonColor="100, 116, 139" icon={<StorageIcon />} themeMode={themeMode} />
    </Grid>
  );
});
