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
  if (!row || !row.date) return '';
  
  const day = String(row.date.day || 1).padStart(2, '0');
  const month = String(row.date.month || 1).padStart(2, '0');
  const year = row.date.year;

  // Если есть часы и минуты (для 5-минуток и часов)
  if (row.time) {
    const hour = String(row.time.hour ?? 0).padStart(2, '0');
    const minute = String(row.time.minute ?? 0).padStart(2, '0');
    return `${day}.${month} ${hour}:${minute}`;
  }

  if (range === 'month') {
    return `${month}.${year}`;
  }
  
  return `${day}.${month}.${year}`;
};

export const generateDates = (row: any): number => {
  if (!row || !row.date) return 0;

  // Безопасно парсим компоненты, предотвращая появление undefined или строк
  const year = Number(row.date.year);
  const month = Number(row.date.month || 1) - 1; // Месяцы в JS идут от 0 до 11
  const day = Number(row.date.day || 1);
  
  const hour = row.time ? Number(row.time.hour ?? 0) : 0;
  const minute = row.time ? Number(row.time.minute ?? 0) : 0;

  const parsedDate = new Date(year, month, day, hour, minute, 0, 0);
  const timestamp = parsedDate.getTime();

  // Если дата спарсилась криво, возвращаем 0, чтобы точка не ломала цикл
  return isNaN(timestamp) ? 0 : timestamp;
};
