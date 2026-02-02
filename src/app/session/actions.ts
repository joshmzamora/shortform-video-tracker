"use server";

import { appwriteService, Collections } from '@/lib/appwrite';
import fs from 'fs-extra';
import path from 'path';
import { Video, formatCaption } from '@/lib/videos';

// This is a placeholder type. The actual type is defined in the page component.
// Using 'any' here to avoid circular dependency issues if we were to import.
type SessionData = any;

export async function getVideos(): Promise<{ success: boolean; videos: Video[]; message?: string }> {
  try {
    const videosDir = path.join(process.cwd(), 'public', 'videos');

    if (!await fs.pathExists(videosDir)) {
      console.warn("Videos directory not found:", videosDir);
      return { success: false, videos: [], message: "Videos directory not found." };
    }

    const files = await fs.readdir(videosDir);
    const validExtensions = ['.mp4', '.mov', '.webm'];

    const videos: Video[] = files
      .filter(file => validExtensions.includes(path.extname(file).toLowerCase()))
      .map(file => ({
        id: file,
        user: '@LocalVideo',
        caption: formatCaption(file),
        genre: 'General',
        src: `/videos/${encodeURIComponent(file)}`
      }));

    if (videos.length === 0) {
      return { success: false, videos: [], message: "No videos found in the directory." };
    }

    // Shuffle videos for randomness (optional but good for experiment)
    return { success: true, videos: videos.sort(() => 0.5 - Math.random()) };
  } catch (error) {
    console.error("Failed to retrieve videos:", error);
    return { success: false, videos: [], message: "Failed to retrieve videos." };
  }
}

export async function saveSessionData(data: SessionData[]) {
  // Bulk save (Legacy/Backup)
  // Saves an array of events as a single record (Session)
  if (!data || data.length === 0) {
    return { success: false, message: "No data to save." };
  }

  try {
    // For bulk save, we might want to iterate or save as one big document.
    // Given the new schema (interactions), we should probably save them individually?
    // But this function is usually called at the END.
    // If we already streamed them, this might be duplicate?
    // The SessionPage calls this as a backup.
    // Let's save it as a "Completed Session" summary or just ignore if streaming works?
    // For safety, let's save it.

    // We can save the whole array as one document in 'sessions' collection for easy backup.
    // Wait, 'sessions' collection was for interactions?
    // Let's use the same collection but maybe a different structure?
    // Actually, let's just loop and save them if they aren't saved?
    // No, that's complex.

    // Simplest: Save the entire session array as a single document with a 'type': 'full_session_backup'
    const backupData = {
      participantId: data[0]?.participantId,
      type: 'full_session_backup',
      timestamp: new Date().toISOString(),
      events: data
    };

    const success = await appwriteService.saveDocument(Collections.Sessions, backupData);
    if (!success) throw new Error("Appwrite save failed");

    return { success: true, message: "Data saved successfully." };
  } catch (error) {
    console.error("Failed to save session data:", error);
    return { success: false, message: "Failed to save data." };
  }
}

export async function saveInteraction(data: SessionData) {
  // Immediate Transmission
  // Saves a single interaction event
  if (!data) {
    return { success: false, message: "No data to save." };
  }

  try {
    const success = await appwriteService.saveDocument(Collections.Sessions, data);
    if (!success) throw new Error("Appwrite save failed");

    return { success: true, message: "Interaction saved." };
  } catch (error) {
    console.error("Failed to save interaction:", error);
    return { success: false, message: "Failed to save interaction." };
  }
}
