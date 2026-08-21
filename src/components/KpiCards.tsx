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
  themeMode: 'light' | 'dark'; // 🌟 Добавьте эту строчку
}

export default function KpiCards({ activeInterface }: KpiCardsProps) {
  const rx = activeInterface?.traffic?.total?.rx || 0;
  const tx = activeInterface?.traffic?.total?.tx || 0;
  const total = rx + tx;

  const cardStyle = (bgColor: string) => ({
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
    border: '1px solid #e2e8f0',
    background: `linear-gradient(135deg, #fff 0%, ${bgColor} 100%)`,
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    },
  });

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {/* Карточка RX */}
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={cardStyle('#f0fdfa')}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(0, 242, 254, 0.1)', color: '#00b4d8', display: 'flex' }}>
              <ArrowDownwardIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Скачано (RX)</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', mt: 0.5 }}>
                {valueToHumanable(rx)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Карточка TX */}
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={cardStyle('#faf5ff')}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(162, 53, 235, 0.1)', color: '#a235eb', display: 'flex' }}>
              <ArrowUpwardIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Отдано (TX)</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', mt: 0.5 }}>
                {valueToHumanable(tx)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Общий трафик */}
      <Grid item xs={12} sm={12} md={4}>
        <Card sx={cardStyle('#f8fafc')}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(100, 116, 139, 0.1)', color: '#64748b', display: 'flex' }}>
              <StorageIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Всего прогнано</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', mt: 0.5 }}>
                {valueToHumanable(total)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
