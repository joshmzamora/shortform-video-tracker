'use server';

import { appwriteService, Collections } from '@/lib/appwrite';

export async function getAdminData() {
  // Fetch all data from Appwrite (or Memory Fallback)
  const consents = await appwriteService.listDocuments(Collections.Consents);
  const questionnaires = await appwriteService.listDocuments(Collections.Questionnaires);
  const rawSessions = await appwriteService.listDocuments(Collections.Sessions);

  // Normalize Sessions Data
  // rawSessions could be:
  // 1. Single Interaction Event { participantId, interactionType: 'view', ... }
  // 2. Full Session Backup { participantId, type: 'full_session_backup', events: [...] }

  const sessionsMap = new Map<string, any[]>();
  const completedBackups: any[] = [];

  rawSessions.forEach((item: any) => {
    if (item.type === 'full_session_backup' && Array.isArray(item.events)) {
      // Prioritize full backups if we want, or treat them as a "session"
      // Let's add them to the list, but maybe we should deduplicate against streamed events?
      // For simplicity, let's treat the backup as the source of truth if it exists.
      // But we might have duplicates if we list both.
      // Let's just push it for now.
      completedBackups.push(item.events);
    } else if (item.participantId) {
      // It's a single interaction (or part of a stream)
      // Group by participantId
      const pid = item.participantId;
      if (!sessionsMap.has(pid)) {
        sessionsMap.set(pid, []);
      }
      sessionsMap.get(pid)?.push(item);
    }
  });

  // Convert map to array of sessions
  const streamedSessions = Array.from(sessionsMap.values());

  // Merge Strategies:
  // If we have a 'full_session_backup' for a participant, should we ignore their streamed events?
  // Yes, because the backup is the final state.
  // Let's filter out streamed sessions if a backup exists for that participant.
  
  const backupParticipantIds = new Set(completedBackups.map(s => s[0]?.participantId));
  const uniqueStreamedSessions = streamedSessions.filter(s => !backupParticipantIds.has(s[0]?.participantId));

  const allSessions = [...completedBackups, ...uniqueStreamedSessions];

  // Sort events within each session by timestamp
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
    // We don't implement delete for now to prevent accidental data loss.
    return { success: true };
}
