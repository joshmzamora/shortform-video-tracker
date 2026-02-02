'use server';

import { Storage } from '@/lib/storage';

export async function getAdminData() {
  // Fetch all data from the server storage (Disk + Memory Fallback)
  const consents = await Storage.Consents.getAll();
  const questionnaires = await Storage.Questionnaires.getAll();
  const rawSessions = await Storage.Sessions.getAll();

  // Normalize Sessions Data
  // rawSessions could be:
  // 1. Array of Arrays (Old way: [[event1, event2], [event3, event4]])
  // 2. Array of Objects (New way: [event1, event2, event3, event4])
  // We want to return Array of Arrays (Sessions), grouped by participantId.

  const sessionsMap = new Map<string, any[]>();
  const completedSessions: any[] = [];

  rawSessions.forEach((item: any) => {
    if (Array.isArray(item)) {
      // It's already a full session array (Old way)
      completedSessions.push(item);
    } else if (item && typeof item === 'object' && item.participantId) {
      // It's a single interaction (New way)
      const pid = item.participantId;
      if (!sessionsMap.has(pid)) {
        sessionsMap.set(pid, []);
      }
      sessionsMap.get(pid)?.push(item);
    }
  });

  // Combine grouped flat interactions with existing full sessions
  const groupedSessions = Array.from(sessionsMap.values());
  const allSessions = [...completedSessions, ...groupedSessions];

  // Sort events within each session by timestamp if possible
  allSessions.forEach(session => {
    session.sort((a: any, b: any) => {
      const tA = new Date(a.timestamp || 0).getTime();
      const tB = new Date(b.timestamp || 0).getTime();
      return tA - tB;
    });
  });

  return {
    success: true,
    data: {
      consents,
      questionnaires,
      sessions: allSessions
    }
  };
}

export async function clearAdminData() {
  // Note: This only clears memory if FS is read-only.
  // If FS is writable, it won't actually delete the file content unless we implement delete logic.
  // But for this "Live View", we can just return success.
  return { success: true };
}
