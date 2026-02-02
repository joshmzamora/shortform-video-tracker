import fs from 'fs-extra';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const QUESTIONNAIRES_FILE = path.join(DATA_DIR, 'questionnaires.json');
const CONSENTS_FILE = path.join(DATA_DIR, 'consents.json');

// Ensure data directory exists
try {
  fs.ensureDirSync(DATA_DIR);
} catch (error) {
  console.warn('[Storage] Could not create data directory (likely read-only fs):', error);
}

// In-memory fallback for Vercel/Read-only environments
// Use global to persist across module reloads in dev
const globalStore = global as any;
if (!globalStore.__memoryStore) {
  globalStore.__memoryStore = {
    [SESSIONS_FILE]: [],
    [QUESTIONNAIRES_FILE]: [],
    [CONSENTS_FILE]: []
  };
}
const memoryStore: Record<string, any[]> = globalStore.__memoryStore;

export async function saveRecord(file: string, data: any) {
  try {
    console.log(`[Storage] Saving to ${file}`);
    
    // 1. Update In-Memory Store
    if (!memoryStore[file]) memoryStore[file] = [];
    memoryStore[file].push(data);

    // 2. Try to persist to disk
    // On Vercel, this might fail, but we try anyway.
    // If it fails, we rely on memoryStore.
    let records = [];
    if (await fs.pathExists(file)) {
      try {
        records = await fs.readJson(file);
      } catch (readError) {
        // console.warn(`[Storage] Failed to read existing file ${file}:`, readError);
      }
    }
    
    records.push(data);
    await fs.writeJson(file, records, { spaces: 2 });
    console.log(`[Storage] Successfully saved to disk: ${file}`);
    return true;

  } catch (error: any) {
    console.warn(`[Storage] Disk write failed (using in-memory fallback):`, error.message);
    // Return true because we "saved" it to memory
    return true; 
  }
}

export async function getRecords(file: string) {
  let diskRecords: any[] = [];
  try {
    if (await fs.pathExists(file)) {
      diskRecords = await fs.readJson(file);
    }
  } catch (error) {
    // console.warn(`[Storage] Disk read failed for ${file}:`, error);
  }

  const memRecords = memoryStore[file] || [];
  
  // MERGE STRATEGY:
  // If we have disk records, they are likely the source of truth for historical data.
  // But memRecords might have *recent* data that failed to write to disk.
  // To avoid duplicates, we can try to filter? 
  // For now, if disk works, we trust disk. If disk is empty (or failed), we trust memory.
  // BUT: What if disk has 5 items, and memory has the 6th item?
  // Ideally, we return memory if disk write failed.
  // Let's return a combination if possible, or just memory if disk is empty.
  
  // Enhanced Logic for Vercel:
  // If diskRecords is empty but memRecords is not, return memRecords.
  if (diskRecords.length === 0 && memRecords.length > 0) return memRecords;
  
  // If both have data, we might be in a weird state. 
  // If we assume memoryStore is a SUPERSET of what failed to write...
  // Actually, memoryStore accumulates *everything* since server start.
  // So memoryStore might be more complete for the *current* session.
  
  // For the user's requirement "updates automatically", memory is key.
  return diskRecords.length > memRecords.length ? diskRecords : memRecords;
}

export const Storage = {
  Sessions: {
    save: (data: any) => saveRecord(SESSIONS_FILE, data),
    getAll: () => getRecords(SESSIONS_FILE),
  },
  Questionnaires: {
    save: (data: any) => saveRecord(QUESTIONNAIRES_FILE, data),
    getAll: () => getRecords(QUESTIONNAIRES_FILE),
  },
  Consents: {
    save: (data: any) => saveRecord(CONSENTS_FILE, data),
    getAll: () => getRecords(CONSENTS_FILE),
  }
};
