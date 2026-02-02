'use server';

import fs from 'fs-extra';
import path from 'path';

export async function testStorage() {
  const cwd = process.cwd();
  const dataDir = path.join(cwd, 'data');
  const testFile = path.join(dataDir, 'test-server-action.json');
  
  console.log('[TestStorage] CWD:', cwd);
  console.log('[TestStorage] Data Dir:', dataDir);

  try {
    await fs.ensureDir(dataDir);
    await fs.writeJson(testFile, { success: true, time: new Date().toISOString() });
    console.log('[TestStorage] Write success');
    return { success: true, path: testFile };
  } catch (error) {
    console.error('[TestStorage] Error:', error);
    return { success: false, error: String(error) };
  }
}
