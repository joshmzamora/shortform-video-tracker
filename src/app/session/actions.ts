"use server";

import { appwriteService, Tables } from '@/lib/appwrite';
import fs from 'fs-extra';
import path from 'path';
import { Video, formatCaption } from '@/lib/videos';

// This is a placeholder type. The actual type is defined in the page component.
// Using 'any' here to avoid circular dependency issues if we were to import.
type SessionData = any;

export async function getVideos(): Promise<{ success: boolean; videos: Video[]; message?: string }> {
  try {
    const educationDir = path.join(process.cwd(), 'public', 'videos', 'education');
    let videos: Video[] = [];

    if (await fs.pathExists(educationDir)) {
      const entries = await fs.readdir(educationDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const videoId = entry.name;
          const dirPath = path.join(educationDir, videoId);

          // Check for metadata.json
          const metadataPath = path.join(dirPath, 'metadata.json');
          let metadata: any = {};
          if (await fs.pathExists(metadataPath)) {
            try {
              metadata = await fs.readJson(metadataPath);
            } catch (e) {
              console.error(`Failed to read metadata for ${videoId}`, e);
            }
          }

          // Check for description.txt
          const descPath = path.join(dirPath, 'description.txt');
          let description = '';
          if (await fs.pathExists(descPath)) {
            description = await fs.readFile(descPath, 'utf-8');
          }

          // Check for video file
          const videoPath = path.join(dirPath, 'video.mp4');
          if (await fs.pathExists(videoPath)) {
            videos.push({
              id: videoId,
              user: metadata.channel || '@Unknown',
              caption: metadata.title || formatCaption(videoId),
              genre: 'Education',
              src: `/videos/education/${videoId}/video.mp4`,
              description: description,
              metadata: {
                viewCount: metadata.viewCount,
                likeCount: metadata.likeCount,
                uploadDate: metadata.uploadDate,
                originalUrl: metadata.originalUrl
              }
            });
          }
        }
      }
    }

    // Fallback/Legacy: Check root videos folder
    const videosDir = path.join(process.cwd(), 'public', 'videos');
    if (await fs.pathExists(videosDir)) {
      const files = await fs.readdir(videosDir);
      const validExtensions = ['.mp4', '.mov', '.webm'];
      const legacyVideos = files
        .filter(file => validExtensions.includes(path.extname(file).toLowerCase()))
        .map(file => ({
          id: file,
          user: '@LocalVideo',
          caption: formatCaption(file),
          genre: 'General',
          src: `/videos/${encodeURIComponent(file)}`
        }));

      videos = [...videos, ...legacyVideos];
    }

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

export async function getComments(videoId: string): Promise<{ success: boolean; comments: any[]; message?: string }> {
  try {
    const commentsPath = path.join(process.cwd(), 'public', 'videos', 'education', videoId, 'comments.json');
    if (await fs.pathExists(commentsPath)) {
      const comments = await fs.readJson(commentsPath);
      // Limit to 50 for performance
      return { success: true, comments: comments.slice(0, 50) };
    }
    return { success: false, comments: [], message: "No comments found." };
  } catch (error) {
    console.error("Failed to load comments:", error);
    return { success: false, comments: [], message: "Failed to load comments." };
  }
}

export async function saveSessionData(data: SessionData[]) {
  // Bulk save (Legacy/Backup)
  // Saves an array of events as a single record (Session)
  if (!data || data.length === 0) {
    return { success: false, message: "No data to save." };
  }

  try {
    // Simplest: Save the entire session array as a single document with a 'type': 'full_session_backup'
    const backupData = {
      participantId: data[0]?.participantId,
      type: 'full_session_backup',
      timestamp: new Date().toISOString(),
      events: data
    };

    const success = await appwriteService.saveDocument(Tables.Sessions, backupData);
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
    const success = await appwriteService.saveDocument(Tables.Sessions, data);
    if (!success) throw new Error("Appwrite save failed");

    return { success: true, message: "Interaction saved." };
  } catch (error) {
    console.error("Failed to save interaction:", error);
    return { success: false, message: "Failed to save interaction." };
  }
}
