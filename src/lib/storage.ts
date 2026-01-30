import fs from 'fs-extra';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const QUESTIONNAIRES_FILE = path.join(DATA_DIR, 'questionnaires.json');

// Ensure data directory exists
fs.ensureDirSync(DATA_DIR);

export async function saveRecord(file: string, data: any) {
  try {
    let records = [];
    if (await fs.pathExists(file)) {
      records = await fs.readJson(file);
    }
    records.push(data);
    await fs.writeJson(file, records, { spaces: 2 });
    return true;
  } catch (error) {
    console.error(`Error saving to ${file}:`, error);
    return false;
  }
}

export async function getRecords(file: string) {
  try {
    if (await fs.pathExists(file)) {
      return await fs.readJson(file);
    }
    return [];
  } catch (error) {
    console.error(`Error reading from ${file}:`, error);
    return [];
  }
}

export const Storage = {
  Sessions: {
    save: (data: any) => saveRecord(SESSIONS_FILE, data),
    getAll: () => getRecords(SESSIONS_FILE),
  },
  Questionnaires: {
    save: (data: any) => saveRecord(QUESTIONNAIRES_FILE, data),
    getAll: () => getRecords(QUESTIONNAIRES_FILE),
  }
};
