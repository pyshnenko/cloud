// utils/vnstatHelpers.ts

const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

// 🌟 Важно: Функция должна быть экспортирована именно как именованный экспорт (export const)
export const valueToHumanable = (bytesData: string | number): string => {
  let num = Number(bytesData);
  if (!num || isNaN(num)) return '0 B';
  
  let unitIndex = 0;
  while (num >= 1024 && unitIndex < units.length - 1) {
    num /= 1024;
    unitIndex++;
  }
  
  return `${num.toFixed(2)} ${units[unitIndex]}`;
};

export const generateDates = (row: any): number => {
  if (!row || !row.date) return 0;

  const year = Number(row.date.year);
  const month = Number(row.date.month || 1) - 1; // 0-11
  const day = Number(row.date.day || 1);
  
  let hour = 0;
  let minute = 0;

  if (row.time) {
    hour = Number(row.time.hour ?? 0);
    minute = Number(row.time.minute ?? 0);
  } else if (row.hour !== undefined) {
    hour = Number(row.hour);
  }

  const parsedDate = new Date(year, month, day, hour, minute, 0, 0);
  const timestamp = parsedDate.getTime();

  return isNaN(timestamp) ? 0 : timestamp;
};

export const generateLabels = (row: any, range: string): string => {
  if (!row || !row.date) return '';
  
  const day = String(row.date.day || 1).padStart(2, '0');
  const month = String(row.date.month || 1).padStart(2, '0');
  const year = row.date.year;

  let hour: string | null = null;
  let minute: string | null = null;

  if (row.time) {
    hour = String(row.time.hour ?? 0).padStart(2, '0');
    minute = String(row.time.minute ?? 0).padStart(2, '0');
  } else if (row.hour !== undefined) {
    hour = String(row.hour).padStart(2, '0');
  }

  if (hour !== null) {
    return minute !== null 
      ? `${day}.${month} ${hour}:${minute}` 
      : `${day}.${month} ${hour}:00`;
  }

  if (range === 'month') {
    return `${month}.${year}`;
  }
  
  return `${day}.${month}.${year}`;
};
