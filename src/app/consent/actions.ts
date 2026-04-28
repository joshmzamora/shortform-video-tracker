"use server";

import { generateParticipantId, postToGoogleSheets } from '@/lib/google-sheets-webhook';

export type ConsentData = {
  participantId: string;
  participantName: string;
  parentalConsentAgreed: boolean;
  agreed: boolean;
  timestamp: string;
  isHighSchoolStudent: boolean;
  isAnonymous: boolean;
};

export async function saveConsentData(data: ConsentData) {
  console.log("[saveConsentData] Received data:", data);
  if (!data || !data.participantId) {
    console.warn("[saveConsentData] Incomplete data");
    return { success: false, message: "Incomplete data." };
  }

  try {
    const success = await postToGoogleSheets({
      table: 'consents',
      data,
    });
    if (!success) throw new Error("Google Sheets webhook save failed");

    return { success: true, message: "Consent data saved successfully." };
  } catch (error) {
    console.error("Failed to save consent data:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Failed to save data: ${errorMessage}` };
  }
}

export async function getConsentsCount() {
  return 0;
}

export async function createParticipantId() {
  return generateParticipantId();
}
