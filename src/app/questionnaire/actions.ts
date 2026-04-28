"use server";

import { postToGoogleSheets } from '@/lib/google-sheets-webhook';

export type QuestionnaireData = {
  participantId: string;
  answers: { [key: string]: string };
  screenTime: {
    tiktok: string;
    instagram: string;
    youtube: string;
    snapchat: string;
  };
  shortFormPercentage: number;
  screenTimeScreenshot?: string; // Base64 string
  timestamp: string;
};

export async function saveQuestionnaireData(data: QuestionnaireData) {
  if (!data || !data.participantId || Object.keys(data.answers).length === 0) {
    return { success: false, message: "Incomplete data." };
  }

  try {
    const success = await postToGoogleSheets({
      table: 'questionnaires',
      data: {
        ...data,
        answers: JSON.stringify(data.answers),
        screenTime: JSON.stringify(data.screenTime),
      },
    });
    if (!success) throw new Error("Google Sheets webhook save failed");

    return { success: true, message: "Questionnaire data saved successfully." };
  } catch (error) {
    console.error("Failed to save questionnaire data:", error);
    return { success: false, message: "Failed to save data." };
  }
}
