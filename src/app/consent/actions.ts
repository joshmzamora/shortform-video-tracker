"use server";

import { appwriteService, Collections } from '@/lib/appwrite';

export type ConsentData = {
  participantId: string;
  participantName: string;
  witnessName: string;
  pocName: string;
  parentalConsentAgreed: boolean;
  agreed: boolean;
  timestamp: string;
};

export async function saveConsentData(data: ConsentData) {
  console.log("[saveConsentData] Received data:", data);
  if (!data || !data.participantId) {
    console.warn("[saveConsentData] Incomplete data");
    return { success: false, message: "Incomplete data." };
  }

  try {
    const success = await appwriteService.saveDocument(Collections.Consents, data);
    if (!success) throw new Error("Appwrite save failed (using fallback)");

    return { success: true, message: "Consent data saved successfully." };
  } catch (error) {
    console.error("Failed to save consent data:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Failed to save data: ${errorMessage}` };
  }
}
