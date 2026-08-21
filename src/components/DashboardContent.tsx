import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import axios from 'axios';

import SyncIcon from '@mui/icons-material/Sync';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightlightRoundIcon from '@mui/icons-material/NightlightRound';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';

import KpiCards from './KpiCards';
import DashboardFilters from './DashboardFilters';
import ChartParticlesBg from './ChartParticlesBg';
import { generateDates, generateLabels, valueToHumanable } from '../utils/vnstatHelpers';
import { ThemeSetting } from './DashboardRoot';

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

interface DashboardContentProps {
  renderMode: 'light' | 'dark';
  themeSetting: ThemeSetting;
  setThemeSetting: (setting: ThemeSetting) => void;
}

export default function DashboardContent({ renderMode, themeSetting, setThemeSetting }: DashboardContentProps) {
  const [fullData, setFullData] = useState<any>(null);
  const [domenList, setDomenList] = useState<string[]>([]);
  const [iface, setiFace] = useState<string>("0");
  const [res, setRes] = useState<string>(''); 
  const [range, setRange] = useState<string>('day');
  const [timePreset, setTimePreset] = useState<string>('week');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const updateData = useCallback((isManualClick: boolean = false) => {
    if (isManualClick) setIsRefreshing(true);
    axios.get('https://spamigor.ru/vnstat/vnstat_summary.json')
      .then((response) => {
        const fetchedData = response.data;
        if (!fetchedData) return;
        const servers = Object.keys(fetchedData);
        setFullData(fetchedData);
        setDomenList(servers);
        setRes((prev) => (prev && servers.includes(prev) ? prev : (servers.includes('spamigor') ? 'spamigor' : servers[0] || '')));
      })
      .catch(err => console.error("Ошибка загрузки данных:", err))
      .finally(() => { if (isManualClick) setTimeout(() => setIsRefreshing(false), 600); });
  }, []);

  useEffect(() => {
    updateData(false);
    const interval = setInterval(() => updateData(false), 120000);
    return () => clearInterval(interval);
  }, [updateData]);

  const activeInterface = useMemo(() => fullData?.[res]?.interfaces?.[Number(iface)] || null, [fullData, res, iface]);
  const ifaceList = useMemo(() => (fullData?.[res]?.interfaces ? fullData[res].interfaces.map((int: any) => int.name) : []), [fullData, res]);

  useEffect(() => {
    if (ifaceList.length > 0) setiFace((prev) => (Number(prev) >= 0 && Number(prev) < ifaceList.length ? prev : "0"));
  }, [ifaceList]);

  const preparedChartData = useMemo(() => {
    if (!fullData?.[res]?.interfaces?.[Number(iface)]?.traffic?.[range]) return { labels: [], datasets: [] };
    const rawTraffic = fullData[res].interfaces[Number(iface)].traffic[range];
    let limitTime = 0; const now = Date.now();
    
    if (timePreset === 'day') limitTime = now - 36 * 60 * 60 * 1000;
    else if (timePreset === 'week') limitTime = now - 8 * 24 * 60 * 60 * 1000;
    else if (timePreset === 'month') limitTime = now - 31 * 24 * 60 * 60 * 1000;
    else if (timePreset === 'year') limitTime = now - 366 * 24 * 60 * 60 * 1000;

    const sortedTraffic = [...rawTraffic].sort((a, b) => generateDates(a) - generateDates(b));
    const labels: string[] = []; const rxData: number[] = []; const txData: number[] = [];

    sortedTraffic.forEach((row: any) => {
      const rowTime = generateDates(row);
      if (rowTime === 0) return;
      if (timePreset === 'all' || rowTime >= limitTime) {
        labels.push(generateLabels(row, range));
        rxData.push((row.rx || 0) / 1024 / 1024 / 1024);
        txData.push((row.tx || 0) / 1024 / 1024 / 1024);
      }
    });

    const isDark = renderMode === 'dark';
    return {
      labels,
      datasets: [
        { fill: true, label: 'Входящий (rx), Gb', data: rxData, borderColor: '#00f2fe', backgroundColor: isDark ? 'rgba(0, 242, 254, 0.01)' : 'rgba(0, 242, 254, 0.03)', borderWidth: 3, tension: 0.35 },
        { fill: true, label: 'Исходящий (tx), Gb', data: txData, borderColor: '#9d4edd', backgroundColor: isDark ? 'rgba(157, 78, 221, 0.01)' : 'rgba(157, 78, 221, 0.03)', borderWidth: 3, tension: 0.35 }
      ]
    };
  }, [fullData, range, iface, timePreset, res, renderMode]);

  const handleSetRes = useCallback((val: string) => setRes(val), []);
  const handleSetIface = useCallback((val: string) => setiFace(val), []);
  const handleSetRange = useCallback((val: string) => setRange(val), []);
  const handleSetTimePreset = useCallback((val: string) => setTimePreset(val), []);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, margin: '0 auto', minHeight: '100vh', position: 'relative' }}>
      
      {/* ⚡ ЭФФЕКТ 5: КИБЕРПАНК СКЕЛЕТОН-SHIMMER ВСПЫШКА */}
      {isRefreshing && (
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, borderRadius: '20px', background: renderMode === 'dark' ? 'linear-gradient(90deg, rgba(15,23,42,0) 0%, rgba(0,242,254,0.06) 50%, rgba(15,23,42,0) 100%)' : 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(79,172,254,0.1) 50%, rgba(255,255,255,0) 100%)', backgroundSize: '200% 100%', animation: 'shimmerWave 1.2s infinite linear' }} />
      )}
      <style>{`@keyframes shimmerWave { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Дашборд Сети</Typography>
            
            {/* 🟢 ЭФФЕКТ 1: ЖИВОЙ ПУЛЬСИРУЮЩИЙ МАРКЕР */}
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10b981', filter: 'drop-shadow(0 0 6px #10b981)', animation: 'pulseLive 2s infinite ease-in-out' }} />
            <style>{`@keyframes pulseLive { 0%, 100% { transform: scale(0.9); opacity: 0.6; } 50% { transform: scale(1.2); opacity: 1; filter: drop-shadow(0 0 10px #10b981); } }`}</style>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <ToggleButtonGroup size="small" value={themeSetting} exclusive onChange={(_, v) => v && setThemeSetting(v)} sx={{ bgcolor: 'background.paper', borderRadius: '12px', border: '1px solid', borderColor: renderMode === 'dark' ? '#334155' : '#e2e8f0', p: '2px' }}>
            <ToggleButton value="light" sx={{ border: 'none', borderRadius: '8px !important' }}><WbSunnyIcon fontSize="small" sx={{ color: themeSetting === 'light' ? '#ffb703' : '#64748b' }} /></ToggleButton>
            <ToggleButton value="dark" sx={{ border: 'none', borderRadius: '8px !important' }}><NightlightRoundIcon fontSize="small" sx={{ color: themeSetting === 'dark' ? '#9d4edd' : '#64748b' }} /></ToggleButton>
            <ToggleButton value="auto" sx={{ border: 'none', borderRadius: '8px !important' }}><SettingsBrightnessIcon fontSize="small" sx={{ color: themeSetting === 'auto' ? '#4facfe' : '#64748b' }} /></ToggleButton>
          </ToggleButtonGroup>

          <ToggleButton value="sync" selected={isRefreshing} onClick={() => updateData(true)} sx={{ borderRadius: '12px', bgcolor: 'background.paper', p: 1, height: 38, width: 38 }}>
            <SyncIcon sx={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none', color: '#4facfe' }} />
            <style>{`@keyframes spin { 100% { transform:rotate(360deg); } }`}</style>
          </ToggleButton>
        </Box>
      </Box>

      <KpiCards activeInterface={activeInterface} themeMode={renderMode} />

      <DashboardFilters 
        themeMode={renderMode} res={res} setRes={handleSetRes} domenList={domenList}
        iface={iface} setIface={handleSetIface} ifaceList={ifaceList}
        range={range} setRange={handleSetRange} timePreset={timePreset} setTimePreset={handleSetTimePreset}
      />

      <Card sx={{ p: { xs: 1, md: 3 }, borderRadius: '16px', bgcolor: 'background.paper', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(16px)', border: '1px solid', borderColor: renderMode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', boxShadow: 'none' }}>
        {/* 🌟 ЭФФЕКТ 4: ИНТЕРАКТИВНЫЕ ПАРАЛЛАКС-ЧАСТИЦЫ */}
        <ChartParticlesBg themeMode={renderMode} />

        {preparedChartData.labels.length > 0 ? (
          <Box sx={{ width: '100%', height: { xs: 300, md: 450 }, position: 'relative', zIndex: 2 }}>
            <Line data={preparedChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' as const }, tooltip: { callbacks: { label: (ctx: any) => `${ctx.dataset.label.split(',')}: ${valueToHumanable(ctx.parsed.y * 1024 * 1024 * 1024)}` } } } }} />
          </Box>
        ) : (
          <Typography sx={{ p: 4, textAlign: 'center', color: '#64748b', position: 'relative', zIndex: 2 }}>Нет точек за выбранный период</Typography>
        )}
      </Card>
    </Box>
  );
}
