"use server";

// This is a placeholder type. The actual type is defined in the page component.
// Using 'any' here to avoid circular dependency issues if we were to import.
type SessionData = any;

export async function saveSessionData(data: SessionData[]) {
  // In a real application, you would validate the data schema here.
  if (!data || data.length === 0) {
    return { success: false, message: "No data to save." };
  }

  console.log("--- SESSION DATA RECEIVED ---");
  console.log(`Participant: ${data[0]?.participantId}`);
  console.log(`Total events: ${data.length}`);
  console.log(JSON.stringify(data, null, 2));
  console.log("--- END OF SESSION DATA ---");

  // In a real application, you would save this data to a database
  // (e.g., Firestore, PostgreSQL, etc.).
  // Example: await db.collection('sessions').add({ 
  //   participantId: data[0]?.participantId, 
  //   events: data, 
  //   createdAt: new Date() 
  // });
  
  return { success: true, message: "Data saved successfully." };
}
