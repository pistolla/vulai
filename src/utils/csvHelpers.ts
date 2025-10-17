import { CsvAthleteRow } from '@/models';
import { parse } from 'papaparse';

export const athletesFromExcel = (file: File): Promise<CsvAthleteRow[]> =>
  new Promise((resolve, reject) =>
    parse<CsvAthleteRow>(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error),
    })
  );

export const toISO = (d?: string | Date) => (d ? new Date(d).toISOString() : new Date().toISOString());
