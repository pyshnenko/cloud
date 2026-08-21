import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend } from 'chart.js';
import axios from 'axios';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import SyncIcon from '@mui/icons-material/Sync';


import KpiCards from '../src/components/KpiCards';
import { generateDates, generateLabels, valueToHumanable } from '../src/utils/vnstatHelpers';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

interface fullData {
  [key: string]: { interfaces: any[] }
}

export default function DedansCharts() {
  const [fullData, setFullData] = useState<fullData>();
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
    axios.get('https://spamigor.ru/vnstat/vnstat_summary.json')
      .then((response) => {
        setFullData(response.data);
        const servers = Object.keys(response.data);
        setDomenList(servers);
        if (servers.length > 0 && !res) {
          setRes(servers.includes('spamigor') ? 'spamigor' : servers[0]);
        }
      })
      .catch(err => console.error("Ошибка загрузки данных:", err))
      .finally(() => setTimeout(() => setIsRefreshing(false), 500));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 120000); // Автообновление каждые 2 минуты
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (fullData?.[res]?.interfaces) {
      const names: string[] = fullData[res].interfaces.map((int: any) => int.name);
      setiFaceList(names);
      const defaultIdx = names.findIndex(name => name.startsWith('e') || name.startsWith('w'));
      setiFace(defaultIdx !== -1 ? String(defaultIdx) : "0");
    }
  }, [res, fullData]);

  useEffect(() => {
    if (fullData?.[res]?.interfaces?.[Number(iface)]?.traffic?.[range]) {
      const rawTraffic = fullData[res].interfaces[Number(iface)].traffic[range];
        
      let limitTime = 0; 
      const now = Date.now();

      // Расширяем временные диапазоны, чтобы данные гарантированно попадали в пресеты
      if (timePreset === 'day') limitTime = now - 36 * 60 * 60 * 1000; // 1.5 суток (для часовых зон)
      else if (timePreset === 'week') limitTime = now - 8 * 24 * 60 * 60 * 1000; // 8 дней вместо 7
      else if (timePreset === 'month') limitTime = now - 31 * 24 * 60 * 60 * 1000; // 31 день
      else if (timePreset === 'year') limitTime = now - 366 * 24 * 60 * 60 * 1000;

      // Сортируем строго от старых точек к новым
      const sortedTraffic = [...rawTraffic].sort((a, b) => generateDates(a) - generateDates(b));
        
      const labels: string[] = [];
      const rxData: number[] = [];
      const txData: number[] = [];

      sortedTraffic.forEach((row: any) => {
        const rowTime = generateDates(row);
        
        // Исключаем "битые" даты (0)
        if (rowTime === 0) return;

        // Если выбран пресет 'all' или точка проходит фильтр по времени
        if (timePreset === 'all' || rowTime >= limitTime) {
            labels.push(generateLabels(row, range));
            
            // Превращаем байты в Гигабайты. 
            // Если точки пустые, пишем 0 вместо undefined, чтобы график не прерывался
            rxData.push((row.rx || 0) / 1024 / 1024 / 1024); 
            txData.push((row.tx || 0) / 1024 / 1024 / 1024);
          }
        });

        setChartData({
          labels,
          datasets: [
          {
            fill: true,
            label: 'Входящий (rx), Gb',
            data: rxData,
            borderColor: '#00f2fe',
            backgroundColor: 'rgba(0, 242, 254, 0.04)',
            borderWidth: 3,
            tension: 0.35,
          },
          {
            fill: true,
            label: 'Исходящий (tx), Gb',
            data: txData,
            borderColor: '#9d4edd',
            backgroundColor: 'rgba(157, 78, 221, 0.04)',
            borderWidth: 3,
            tension: 0.35,
          }
        ]
      });
    }
  }, [fullData, range, iface, timePreset, res]);

  const activeInterface = fullData?.[res]?.interfaces?.[Number(iface)];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, margin: '0 auto', bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* ХЕДЕР */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>Дашборд Сети</Typography>
          {activeInterface?.updated && (
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
              Обновлено: {activeInterface.updated.time.hour}:{String(activeInterface.updated.time.minute).padStart(2, '0')}
            </Typography>
          )}
        </Box>
        <ToggleButton value="sync" selected={isRefreshing} onClick={fetchData} sx={{ borderRadius: '12px', bgcolor: '#fff' }}>
          <SyncIcon sx={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none', color: '#00f2fe' }} />
          <style>{`@keyframes spin { 100% { transform:rotate(360deg); } }`}</style>
        </ToggleButton>
      </Box>

      {/* КАРТОЧКИ СТАТИСТИКИ */}
      <KpiCards activeInterface={activeInterface} />

      {/* УПРАВЛЕНИЕ И СЕЛЕКТОРЫ */}
      <Card sx={{ p: 3, borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: 'none', mb: 4, bgcolor: '#fff' }}>
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
                {ifaceList.map((n, i) => <MenuItem key={n} value={i}>{n}</MenuItem>)}
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
            <ToggleButtonGroup
              fullWidth
              size="small"
              value={timePreset}
              exclusive
              onChange={(_, v) => v && setTimePreset(v)}
              sx={{ bgcolor: '#f1f5f9' }}
            >
              <ToggleButton value="day">День</ToggleButton>
              <ToggleButton value="week">Неделя</ToggleButton>
              <ToggleButton value="month">Месяц</ToggleButton>
              <ToggleButton value="all">Всё</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Card>

      {/* ГРАФИК */}
      <Card sx={{ p: { xs: 1, md: 3 }, borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: 'none', bgcolor: '#fff' }}>
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
                        return `${ctx.dataset.label.split(',')[0]}: ${valueToHumanable(bytes)}`;
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
