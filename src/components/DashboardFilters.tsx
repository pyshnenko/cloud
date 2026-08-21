import React from 'react';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

interface DashboardFiltersProps {
  themeMode: 'light' | 'dark';
  res: string;
  setRes: (v: string) => void;
  domenList: string[];
  iface: string;
  setIface: (v: string) => void;
  ifaceList: string[];
  range: string;
  setRange: (v: string) => void;
  timePreset: string;
  setTimePreset: (v: string) => void;
}

export default React.memo(function DashboardFilters({
  themeMode, res, setRes, domenList, iface, setIface, ifaceList, range, setRange, timePreset, setTimePreset
}: DashboardFiltersProps) {
  const isDark = themeMode === 'dark';

  return (
    <Card sx={{ p: 3, mb: 4, backdropFilter: 'blur(16px)', bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', boxShadow: 'none' }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Сервер</InputLabel>
            <Select value={res} label="Сервер" onChange={(e) => setRes(e.target.value as string)}>
              {domenList.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Интерфейс</InputLabel>
            <Select value={iface} label="Интерфейс" onChange={(e) => setIface(e.target.value as string)}>
              {ifaceList.map((n, i) => <MenuItem key={n} value={String(i)}>{n}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Группировка</InputLabel>
            <Select value={range} label="Группировка" onChange={(e) => setRange(e.target.value as string)}>
              <MenuItem value="fiveminute">5 минут</MenuItem>
              <MenuItem value="hour">Часы</MenuItem>
              <MenuItem value="day">Дни</MenuItem>
              <MenuItem value="month">Месяцы</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ToggleButtonGroup fullWidth size="small" value={timePreset} exclusive onChange={(_, v) => v && setTimePreset(v)} sx={{ bgcolor: isDark ? 'rgba(15,23,42,0.4)' : '#f1f5f9', borderRadius: '10px', p: '2px', border: isDark ? '1px solid #334155' : 'none', '& .MuiToggleButton-root': { border: 'none', borderRadius: '8px !important', color: isDark ? '#94a3b8' : '#475569', textTransform: 'none', fontWeight: 600, '&.Mui-selected': { bgcolor: isDark ? '#334155' : '#ffffff', color: isDark ? '#00f2fe' : '#4facfe', boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 4px rgba(0,0,0,0.05)', '&:hover': { bgcolor: isDark ? '#475569' : '#ffffff' } } } }}>
            <ToggleButton value="day">День</ToggleButton>
            <ToggleButton value="week">Неделя</ToggleButton>
            <ToggleButton value="month">Месяц</ToggleButton>
            <ToggleButton value="all">Всё</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>
    </Card>
  );
});
