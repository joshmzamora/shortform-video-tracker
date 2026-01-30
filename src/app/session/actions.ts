"use server";

import { Storage } from '@/lib/storage';

// This is a placeholder type. The actual type is defined in the page component.
// Using 'any' here to avoid circular dependency issues if we were to import.
type SessionData = any;

export async function saveSessionData(data: SessionData[]) {
  // In a real application, you would validate the data schema here.
  if (!data || data.length === 0) {
    return { success: false, message: "No data to save." };
  }

  try {
    const success = await Storage.Sessions.save(data);
    if (!success) throw new Error("Storage write failed");
    
    return { success: true, message: "Data saved successfully." };
  } catch (error) {
    console.error("Failed to save session data:", error);
    return { success: false, message: "Failed to save data." };
  }
}
