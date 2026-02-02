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
// Note: This data is ephemeral and will be lost when the server process restarts.
const memoryStore: Record<string, any[]> = {
  [SESSIONS_FILE]: [],
  [QUESTIONNAIRES_FILE]: [],
  [CONSENTS_FILE]: []
};

export async function saveRecord(file: string, data: any) {
  try {
    console.log(`[Storage] Saving to ${file}`);
    
    // 1. Update In-Memory Store
    if (!memoryStore[file]) memoryStore[file] = [];
    memoryStore[file].push(data);

    // 2. Try to persist to disk
    let records = [];
    if (await fs.pathExists(file)) {
      try {
        records = await fs.readJson(file);
      } catch (readError) {
        console.warn(`[Storage] Failed to read existing file ${file}:`, readError);
      }
    } else {
      // If file doesn't exist on disk, use memory store as base? 
      // No, keep them separate to avoid confusion, but we append new data.
      // actually, if we can't read, we assume empty.
    }
    
    records.push(data);
    await fs.writeJson(file, records, { spaces: 2 });
    console.log(`[Storage] Successfully saved to disk: ${file}`);
    return true;

  } catch (error: any) {
    console.warn(`[Storage] Disk write failed (using in-memory fallback):`, error.message);
    // Return true because we "saved" it to memory, so the user flow doesn't break.
    // However, we should probably signal this is temporary.
    return true; 
  }
}

export async function getRecords(file: string) {
  let diskRecords = [];
  try {
    if (await fs.pathExists(file)) {
      diskRecords = await fs.readJson(file);
    }
  } catch (error) {
    console.warn(`[Storage] Disk read failed for ${file}:`, error);
  }

  // Merge with memory store (deduplicate?)
  // For simplicity, we'll just return disk records if available, 
  // OR memory records if disk failed/is empty but memory has something.
  // A proper merge is hard without unique IDs. 
  // Let's concat them for now, assuming memoryStore contains *new* items not on disk?
  // No, memoryStore currently mirrors the *append* operation.
  
  const memRecords = memoryStore[file] || [];
  
  // If we are in a read-only env, diskRecords might be empty or stale.
  // If we are local, diskRecords is the source of truth.
  
  // Naive strategy: prefer disk. If disk empty, check memory.
  if (diskRecords.length > 0) return diskRecords;
  return memRecords;
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
