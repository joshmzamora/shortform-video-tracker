"use server";

import { Storage } from '@/lib/storage';
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
