'use server';

import { readFromGoogleSheets } from '@/lib/google-sheets-webhook';

function parseBoolean(value: unknown) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return false;
}

function parseNumber(value: unknown) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value !== 'string') return value as T;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function getAdminData() {
  const [consentsResult, questionnairesResult, sessionsResult] = await Promise.all([
    readFromGoogleSheets('consents'),
    readFromGoogleSheets('questionnaires'),
    readFromGoogleSheets('sessions'),
  ]);

  const consents = consentsResult.success ? ((consentsResult.data || []) as any[]).map((row) => ({
    ...row,
    parentalConsentAgreed: parseBoolean(row.parentalConsentAgreed),
    agreed: parseBoolean(row.agreed),
    isHighSchoolStudent: parseBoolean(row.isHighSchoolStudent),
    isAnonymous: parseBoolean(row.isAnonymous),
  })) : [];

  const questionnaires = questionnairesResult.success ? ((questionnairesResult.data || []) as any[]).map((row) => ({
    ...row,
    answers: parseJsonField(row.answers, {}),
    screenTime: parseJsonField(row.screenTime, {}),
    shortFormPercentage: parseNumber(row.shortFormPercentage) ?? 0,
  })) : [];

  const rawSessions = sessionsResult.success ? ((sessionsResult.data || []) as any[]).map((row) => ({
    ...row,
    watchTimeMs: parseNumber(row.watchTimeMs) ?? 0,
    videoDurationMs: parseNumber(row.videoDurationMs),
    events: parseJsonField(row.events, []),
  })) : [];

  const sessionsMap = new Map<string, any[]>();
  const completedBackups: any[] = [];

  rawSessions.forEach((item: any) => {
    if (item.type === 'full_session_backup' && Array.isArray(item.events)) {
      completedBackups.push(item.events);
    } else if (item.participantId) {
      const pid = item.participantId;
      if (!sessionsMap.has(pid)) {
        sessionsMap.set(pid, []);
      }
      sessionsMap.get(pid)?.push(item);
    }
  });

  const streamedSessions = Array.from(sessionsMap.values());
  const backupParticipantIds = new Set(completedBackups.map(s => s[0]?.participantId));
  const uniqueStreamedSessions = streamedSessions.filter(s => !backupParticipantIds.has(s[0]?.participantId));
  const allSessions = [...completedBackups, ...uniqueStreamedSessions];

  allSessions.forEach(session => {
    session.sort((a: any, b: any) => {
      const tA = new Date(a.timestamp || 0).getTime();
      const tB = new Date(b.timestamp || 0).getTime();
      return tA - tB;
    });
  });

  return {
    success: consentsResult.success || questionnairesResult.success || sessionsResult.success,
    data: {
      consents: consents.sort((a: any, b: any) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()),
      questionnaires: questionnaires.sort((a: any, b: any) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()),
      sessions: allSessions
    },
    message: [consentsResult, questionnairesResult, sessionsResult]
      .filter((result) => !result.success && result.message)
      .map((result) => result.message)
      .join(' | '),
  };
}

export async function clearAdminData() {
  // We don't implement delete for now to prevent accidental data loss.
  return { success: true };
}

export async function getConsent(participantId: string) {
  if (!participantId) return { success: false, message: "No ID provided" };

  try {
    const result = await readFromGoogleSheets('consents', { participantId });
    if (!result.success) {
      return { success: false, message: result.message || "Consent not found" };
    }

    const consents = (result.data || []) as any[];
    const consent = consents.find((c: any) => c.participantId === participantId);

    if (consent) {
      return {
        success: true,
        data: {
          ...consent,
          parentalConsentAgreed: parseBoolean(consent.parentalConsentAgreed),
          agreed: parseBoolean(consent.agreed),
          isHighSchoolStudent: parseBoolean(consent.isHighSchoolStudent),
          isAnonymous: parseBoolean(consent.isAnonymous),
        }
      };
    }
    return { success: false, message: "Consent not found" };
  } catch (e) {
    console.error("Failed to fetch consent:", e);
    return { success: false, message: "Server error" };
  }
}
