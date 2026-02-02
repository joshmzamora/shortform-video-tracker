"use server";

import { Storage } from '@/lib/storage';

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
    const success = await Storage.Consents.save(data);
    if (!success) throw new Error("Storage write failed");

    return { success: true, message: "Consent data saved successfully." };
  } catch (error) {
    console.error("Failed to save consent data:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Failed to save data: ${errorMessage}` };
  }
}
