"use server";

import { Storage } from '@/lib/storage';

export type QuestionnaireData = {
  participantId: string;
  answers: { [key: string]: string };
  timestamp: string;
};

export async function saveQuestionnaireData(data: QuestionnaireData) {
  if (!data || !data.participantId || Object.keys(data.answers).length === 0) {
    return { success: false, message: "Incomplete data." };
  }

  try {
    const success = await Storage.Questionnaires.save(data);
    if (!success) throw new Error("Storage write failed");

    return { success: true, message: "Questionnaire data saved successfully." };
  } catch (error) {
    console.error("Failed to save questionnaire data:", error);
    return { success: false, message: "Failed to save data." };
  }
}
