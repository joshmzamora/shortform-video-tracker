"use server";

export type QuestionnaireData = {
  participantId: string;
  answers: { [key: string]: string };
  parentConsent: boolean;
  timestamp: string;
};

export async function saveQuestionnaireData(data: QuestionnaireData) {
  if (!data || !data.participantId || Object.keys(data.answers).length === 0 || !data.parentConsent) {
    return { success: false, message: "Incomplete data." };
  }

  console.log("--- QUESTIONNAIRE DATA RECEIVED ---");
  console.log(`Participant: ${data.participantId}`);
  console.log(`Timestamp: ${data.timestamp}`);
  console.log(`Parental Consent: ${data.parentConsent}`);
  console.log("Answers:");
  console.log(JSON.stringify(data.answers, null, 2));
  console.log("--- END OF QUESTIONNAIRE DATA ---");

  // In a real application, you would save this data to a database.
  
  return { success: true, message: "Questionnaire data saved successfully." };
}
