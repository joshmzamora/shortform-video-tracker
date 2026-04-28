'use server';

import fs from 'fs-extra';
import path from 'path';

export async function testStorage(_formData: FormData): Promise<void> {
  const cwd = process.cwd();
  const dataDir = path.join(cwd, 'data');
  const testFile = path.join(dataDir, 'test-server-action.json');
  
  console.log('[TestStorage] CWD:', cwd);
  console.log('[TestStorage] Data Dir:', dataDir);

  try {
    await fs.ensureDir(dataDir);
    await fs.writeJson(testFile, { success: true, time: new Date().toISOString() });
    console.log('[TestStorage] Write success');
    return;
  } catch (error) {
    console.error('[TestStorage] Error:', error);
    return;
  }
}
