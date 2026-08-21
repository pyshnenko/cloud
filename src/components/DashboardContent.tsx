import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import IconButton from '@mui/material/IconButton';
import axios from 'axios';

import SyncIcon from '@mui/icons-material/Sync';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

import KpiCards from './KpiCards';
import { generateDates, generateLabels, valueToHumanable } from '../utils/vnstatHelpers';

interface DashboardContentProps {
  themeMode: 'light' | 'dark';
  setThemeMode: (m: 'light' | 'dark') => void;
}

export default function DashboardContent({ themeMode, setThemeMode }: DashboardContentProps) {
  const [fullData, setFullData] = useState<any>();
  const [domenList, setDomenList] = useState<string[]>([]);
  const [ifaceList, setiFaceList] = useState<string[]>([]);
  const [iface, setiFace] = useState<string>("0");
  const [res, setRes] = useState<string>(''); 
  const [range, setRange] = useState<string>('day');
  const [timePreset, setTimePreset] = useState<string>('week');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [chartData, setChartData] = useState({ labels: [] as string[], datasets: [] as any[] });

  const fetchData = () => {
    setIsRefreshing(true);
    axios.get('https://spamigor.ru')
      .then((response) => {
        setFullData(response.data);
        const servers = Object.keys(response.data);
        setDomenList(servers);
        if (servers.length > 0 && !res) {
          setRes(servers.includes('spamigor') ? 'spamigor' : servers[0]);
        }
      })
      .catch(err => console.error("Ошибка загрузки:", err))
      .finally(() => setTimeout(() => setIsRefreshing(false), 500));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 120000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (fullData?.[res]?.interfaces) {
      const names = fullData[res].interfaces.map((int: any) => int.name);
      setiFaceList(names);
      const defaultIdx = names.findIndex((name: string) => name.startsWith('e') || name.startsWith('w'));
      setiFace(defaultIdx !== -1 ? String(defaultIdx) : "0");
    }
  }, [res, fullData]);

  useEffect(() => {
    if (fullData?.[res]?.interfaces?.[Number(iface)]?.traffic?.[range]) {
      const rawTraffic = fullData[res].interfaces[Number(iface)].traffic[range];
      let limitTime = 0;
      const now = Date.now();
      
      if (timePreset === 'day') limitTime = now - 36 * 60 * 60 * 1000;
      else if (timePreset === 'week') limitTime = now - 8 * 24 * 60 * 60 * 1000;
      else if (timePreset === 'month') limitTime = now - 31 * 24 * 60 * 60 * 1000;
      else if (timePreset === 'year') limitTime = now - 366 * 24 * 60 * 60 * 1000;

      const sortedTraffic = [...rawTraffic].sort((a, b) => generateDates(a) - generateDates(b));
      const labels: string[] = [];
      const rxData: number[] = [];
      const txData: number[] = [];

      sortedTraffic.forEach((row: any) => {
        const rowTime = generateDates(row);
        if (rowTime === 0) return;
        if (timePreset === 'all' || rowTime >= limitTime) {
          labels.push(generateLabels(row, range));
          rxData.push((row.rx || 0) / 1024 / 1024 / 1024);
          txData.push((row.tx || 0) / 1024 / 1024 / 1024);
        }
      });

      const isDark = themeMode === 'dark';
      setChartData({
        labels,
        datasets: [
          {
            fill: true,
            label: 'Входящий (rx), Gb',
            data: rxData,
            borderColor: '#00f2fe',
            backgroundColor: isDark ? 'rgba(0, 242, 254, 0.02)' : 'rgba(0, 242, 254, 0.05)',
            borderWidth: 3,
            tension: 0.35,
          },
          {
            fill: true,
            label: 'Исходящий (tx), Gb',
            data: txData,
            borderColor: '#9d4edd',
            backgroundColor: isDark ? 'rgba(157, 78, 221, 0.02)' : 'rgba(157, 78, 221, 0.05)',
            borderWidth: 3,
            tension: 0.35,
          }
        ]
      });
    }
  }, [fullData, range, iface, timePreset, res, themeMode]);

  const activeInterface = fullData?.[res]?.interfaces?.[Number(iface)];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, margin: '0 auto', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Дашборд Сети</Typography>
          {activeInterface?.updated && (
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
              Обновлено: {activeInterface.updated.time.hour}:{String(activeInterface.updated.time.minute).padStart(2, '0')}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <IconButton onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')} sx={{ p: 1.5, border: '1px solid', borderColor: themeMode === 'dark' ? '#334155' : '#e2e8f0', bgcolor: 'background.paper', borderRadius: '12px' }}>
            {themeMode === 'dark' ? <Brightness7Icon sx={{ color: '#fbbf24' }} /> : <Brightness4Icon sx={{ color: '#64748b' }} />}
          </IconButton>
          <ToggleButton value="sync" selected={isRefreshing} onClick={fetchData} sx={{ borderRadius: '12px', bgcolor: 'background.paper', p: 1.5 }}>
            <SyncIcon sx={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none', color: '#4facfe' }} />
            <style>{`@keyframes spin { 100% { transform:rotate(360deg); } }`}</style>
          </ToggleButton>
        </Box>
      </Box>

      <KpiCards activeInterface={activeInterface} themeMode={themeMode} />

      <Card sx={{ p: 3, mb: 4, bgcolor: 'background.paper' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Сервер</InputLabel>
              <Select value={res} label="Сервер" onChange={(e) => setRes(e.target.value)}>
                {domenList.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Интерфейс</InputLabel>
              <Select value={iface} label="Интерфейс" onChange={(e) => setiFace(e.target.value)}>
                {ifaceList.map((n, i) => <MenuItem key={n} value={String(i)}>{n}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Группировка</InputLabel>
              <Select value={range} label="Группировка" onChange={(e) => setRange(e.target.value)}>
                <MenuItem value="fiveminute">5 минут</MenuItem>
                <MenuItem value="hour">Часы</MenuItem>
                <MenuItem value="day">Дни</MenuItem>
                <MenuItem value="month">Месяцы</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <ToggleButtonGroup fullWidth size="small" value={timePreset} exclusive onChange={(_, v) => v && setTimePreset(v)} sx={{ bgcolor: themeMode === 'dark' ? '#334155' : '#f1f5f9' }}>
              <ToggleButton value="day">День</ToggleButton>
              <ToggleButton value="week">Неделя</ToggleButton>
              <ToggleButton value="month">Месяц</ToggleButton>
              <ToggleButton value="all">Всё</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ p: { xs: 1, md: 3 }, borderRadius: '16px', bgcolor: 'background.paper' }}>
        {chartData.labels.length > 0 ? (
          <Box sx={{ width: '100%', height: { xs: 300, md: 450 } }}>
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' as const },
                  tooltip: {
                    callbacks: {
                      label: (ctx: any) => {
                        const bytes = ctx.parsed.y * 1024 * 1024 * 1024;
                        return `${ctx.dataset.label.split(',')}: ${valueToHumanable(bytes)}`;
                      }
                    }
                  }
                }
              }}
            />
          </Box>
        ) : (
          <Typography sx={{ p: 4, textAlign: 'center', color: '#64748b' }}>Нет точек за выбранный период</Typography>
        )}
      </Card>
    </Box>
  );
}
