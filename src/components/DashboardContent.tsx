import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import IconButton from '@mui/material/IconButton';
import axios from 'axios';

import SyncIcon from '@mui/icons-material/Sync';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

import KpiCards from './KpiCards';
import DashboardFilters from './DashboardFilters';
import { generateDates, generateLabels, valueToHumanable } from '../utils/vnstatHelpers';

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

interface DashboardContentProps {
  themeMode: 'light' | 'dark';
  setThemeMode: (m: 'light' | 'dark') => void;
}

export default function DashboardContent({ themeMode, setThemeMode }: DashboardContentProps) {
  const [fullData, setFullData] = useState<any>(null);
  const [domenList, setDomenList] = useState<string[]>([]);
  const [iface, setiFace] = useState<string>("0");
  const [res, setRes] = useState<string>(''); 
  const [range, setRange] = useState<string>('day');
  const [timePreset, setTimePreset] = useState<string>('week');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Оптимизация 1: Оборачиваем функцию запроса в useCallback
  const updateData = useCallback((isManualClick: boolean = false) => {
    if (isManualClick) setIsRefreshing(true);
    axios.get('https://spamigor.ru/vnstat/vnstat_summary.json')
      .then((response) => {
        const fetchedData = response.data;
        if (!fetchedData) return;
        
        const servers = Object.keys(fetchedData);
        setFullData(fetchedData);
        setDomenList(servers);
        
        setRes((prevRes) => {
          if (prevRes && servers.includes(prevRes)) return prevRes;
          return servers.includes('spamigor') ? 'spamigor' : (servers[0] || '');
        });
      })
      .catch(err => console.error("Ошибка загрузки данных:", err))
      .finally(() => { 
        if (isManualClick) setTimeout(() => setIsRefreshing(false), 500); 
      });
  }, []);

  useEffect(() => {
    updateData(false);
    const interval = setInterval(() => updateData(false), 120000);
    return () => clearInterval(interval);
  }, [updateData]);

  // Вычисляем текущий активный интерфейс (изолируем ссылку)
  const activeInterface = useMemo(() => {
    return fullData?.[res]?.interfaces?.[Number(iface)] || null;
  }, [fullData, res, iface]);

  // Вычисляем список названий интерфейсов для селектора
  const ifaceList = useMemo(() => {
    if (!fullData?.[res]?.interfaces) return [];
    return fullData[res].interfaces.map((int: any) => int.name);
  }, [fullData, res]);

  // Синхронизируем индекс интерфейса при смене сервера
  useEffect(() => {
    if (ifaceList.length > 0) {
      setiFace((prev) => {
        const idx = Number(prev);
        if (idx >= 0 && idx < ifaceList.length) return prev;
        const defaultIdx = ifaceList.findIndex((name: string) => name.startsWith('e') || name.startsWith('w'));
        return defaultIdx !== -1 ? String(defaultIdx) : "0";
      });
    }
  }, [ifaceList]);

  // Оптимизация 2: Избавляемся от стейта chartData. Вычисляем структуру «на лету» через useMemo
  const preparedChartData = useMemo(() => {
    if (!fullData?.[res]?.interfaces?.[Number(iface)]?.traffic?.[range]) {
      return { labels: [], datasets: [] };
    }

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
    return {
      labels,
      datasets: [
        { fill: true, label: 'Входящий (rx), Gb', data: rxData, borderColor: '#00f2fe', backgroundColor: isDark ? 'rgba(0, 242, 254, 0.02)' : 'rgba(0, 242, 254, 0.05)', borderWidth: 3, tension: 0.35 },
        { fill: true, label: 'Исходящий (tx), Gb', data: txData, borderColor: '#9d4edd', backgroundColor: isDark ? 'rgba(157, 78, 221, 0.02)' : 'rgba(157, 78, 221, 0.05)', borderWidth: 3, tension: 0.35 }
      ]
    };
  }, [fullData, range, iface, timePreset, res, themeMode]);

  // Запоминаем функции изменения стейта, чтобы не ломать React.memo в фильтрах
  const handleSetRes = useCallback((val: string) => setRes(val), []);
  const handleSetIface = useCallback((val: string) => setiFace(val), []);
  const handleSetRange = useCallback((val: string) => setRange(val), []);
  const handleSetTimePreset = useCallback((val: string) => setTimePreset(val), []);
  const handleManualRefresh = useCallback(() => updateData(true), [updateData]);

  // Опции конфигурации осей графика кэшируем в зависимости от темы
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.dataset.label.split(',')}: ${valueToHumanable(ctx.parsed.y * 1024 * 1024 * 1024)}`
        }
      }
    }
  }), []);

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
          <ToggleButton value="sync" selected={isRefreshing} onClick={handleManualRefresh} sx={{ borderRadius: '12px', bgcolor: 'background.paper', p: 1.5 }}>
            <SyncIcon sx={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none', color: '#4facfe' }} />
            <style>{`@keyframes spin { 100% { transform:rotate(360deg); } }`}</style>
          </ToggleButton>
        </Box>
      </Box>

      <KpiCards activeInterface={activeInterface} themeMode={themeMode} />

      <DashboardFilters 
        themeMode={themeMode} res={res} setRes={handleSetRes} domenList={domenList}
        iface={iface} setIface={handleSetIface} ifaceList={ifaceList}
        range={range} setRange={handleSetRange} timePreset={timePreset} setTimePreset={handleSetTimePreset}
      />

      <Card sx={{ p: { xs: 1, md: 3 }, borderRadius: '16px', bgcolor: 'background.paper' }}>
        {preparedChartData.labels.length > 0 ? (
          <Box sx={{ width: '100%', height: { xs: 300, md: 450 } }}>
            <Line data={preparedChartData} options={chartOptions} />
          </Box>
        ) : (
          <Typography sx={{ p: 4, textAlign: 'center', color: '#64748b' }}>Нет точек за выбранный период</Typography>
        )}
      </Card>
    </Box>
  );
}
