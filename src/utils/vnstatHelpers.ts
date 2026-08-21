const values = ['b', 'kb', 'Mb', 'Gb', 'Tb', 'Pb'];

const del1024 = ({ num, mn }: { num: number; mn: number }): { num: number; mn: number } => {
  if (num > 1024 && mn < values.length - 1) {
    return del1024({ num: num / 1024, mn: mn + 1 });
  }
  return { num, mn };
};

export const valueToHumanable = (bytesData: string | number): string => {
  const mass = Number(bytesData);
  if (!mass) return '0 b';
  const d = del1024({ num: mass, mn: 0 });
  return `${d.num.toFixed(2)} ${values[d.mn]}`;
};

export const generateLabels = (row: any, range: string): string => {
  const d = `${String(row.date.day).padStart(2, '0')}.${String(row.date.month).padStart(2, '0')}`;
  if (row.time) {
    return `${d} ${String(row.time.hour).padStart(2, '0')}:${String(row.time.minute).padStart(2, '0')}`;
  }
  if (range === 'month') return `${String(row.date.month).padStart(2, '0')}.${row.date.year}`;
  return d;
};

export const generateDates = (row: any): number => {
  const exDate = new Date(0);
  if (row.time) {
    exDate.setHours(row.time.hour);
    exDate.setMinutes(row.time.minute);
  }
  if (row.date?.day) exDate.setDate(row.date.day);
  if (row.date?.month) exDate.setMonth(row.date.month - 1);
  if (row.date?.year) exDate.setFullYear(row.date.year);
  return Number(exDate);
};
