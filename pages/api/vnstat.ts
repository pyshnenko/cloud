import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';
import formidable from 'formidable';

// Секретный ключ авторизации
const API_KEY = process.env.VNSTAT_API_KEY || "super_secret_token";

// Внутреннее хранилище отдельных файлов серверов
const DATA_DIR = path.join(process.cwd(), 'data', 'vnstat');

// НОВЫЙ ПУТЬ: Итоговый файл пишется напрямую в репозиторий Nginx
const SUMMARY_FILE_PATH = '/var/www/html/vnstat/vnstat_summary.json';

export const config = {
  api: {
    bodyParser: false, // Отключаем стандартный парсер для работы с formidable
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Проверка токена безопасности
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const form = formidable({
    multiples: false,
    maxFileSize: 5 * 1024 * 1024,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Ошибка парсинга формы:', err);
      return res.status(500).json({ error: 'Error parsing upload' });
    }

    const serverName = Array.isArray(fields['server_name']) ? fields['server_name'][0] : fields['server_name'];
    const fileData = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!serverName || !fileData) {
      return res.status(400).json({ error: 'Missing server_name or file' });
    }

    try {
      // 2. Чтение присланного лога
      const rawContent = await fs.readFile(fileData.filepath, 'utf-8');
      
      let jsonContent;
      try {
        jsonContent = JSON.parse(rawContent);
      } catch (e) {
        return res.status(400).json({ error: 'Uploaded file is not a valid JSON' });
      }

      // 3. Сохранение промежуточного файла сервера
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(
        path.join(DATA_DIR, `${serverName}.json`),
        JSON.stringify(jsonContent, null, 2)
      );

      // 4. Слияние всех логов в один объект
      const allFiles = await fs.readdir(DATA_DIR);
      const summary: Record<string, any> = {};

      for (const file of allFiles) {
        if (file.endsWith('.json')) {
          const filePath = path.join(DATA_DIR, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const name = path.basename(file, '.json');
          
          try {
            summary[name] = JSON.parse(content);
          } catch (e) {
            console.error(`Пропущен поврежденный файл ${file}:`, e);
          }
        }
      }

      // 5. Запись напрямую в статику Nginx
      await fs.mkdir(path.dirname(SUMMARY_FILE_PATH), { recursive: true });
      await fs.writeFile(SUMMARY_FILE_PATH, JSON.stringify(summary));

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Ошибка файловой системы:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });
}
