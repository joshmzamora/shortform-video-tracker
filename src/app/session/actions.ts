"use server";

import { postToGoogleSheets } from '@/lib/google-sheets-webhook';
import fs from 'fs-extra';
import path from 'path';
import { Video, formatCaption } from '@/lib/videos';

type SessionData = any;

export async function getVideos(): Promise<{ success: boolean; videos: Video[]; message?: string }> {
  try {
    const videosDir = path.join(process.cwd(), 'public', 'videos');
    const genres = ['doomscroll', 'educational', 'entertainment', 'inspirational', 'relatable'];
    const videos: Video[] = [];

    for (const genre of genres) {
      const genreDir = path.join(videosDir, genre);
      if (!(await fs.pathExists(genreDir))) continue;

      const files = await fs.readdir(genreDir);
      for (const file of files) {
        if (path.extname(file).toLowerCase() !== '.txt') continue;

        const filePath = path.join(genreDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const urlMatch = content.match(/cite="(https:\/\/www\.tiktok\.com\/[^\"]+)"/);
        const videoIdMatch = urlMatch?.[1]?.match(/\/video\/(\d+)/);

        if (!videoIdMatch?.[1]) continue;

        const videoId = path.basename(file, '.txt');
        videos.push({
          id: `${genre}_${videoId}`,
          user: '@Unknown',
          caption: formatCaption(videoId),
          genre: genre.charAt(0).toUpperCase() + genre.slice(1),
          src: videoIdMatch[1],
        });
      }
    }

    if (videos.length === 0) {
      return { success: false, videos: [], message: "No videos found in the directory." };
    }

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
      return { success: true, comments: comments.slice(0, 50) };
    }
    return { success: false, comments: [], message: "No comments found." };
  } catch (error) {
    console.error("Failed to load comments:", error);
    return { success: false, comments: [], message: "Failed to load comments." };
  }
}

export async function saveSessionData(data: SessionData[]) {
  if (!data || data.length === 0) {
    return { success: false, message: "No data to save." };
  }

  try {
    const backupData = {
      participantId: data[0]?.participantId,
      type: 'full_session_backup',
      timestamp: new Date().toISOString(),
      events: JSON.stringify(data),
    };

    const success = await postToGoogleSheets({
      table: 'sessions',
      data: backupData,
    });
    if (!success) throw new Error("Google Sheets webhook save failed");

    return { success: true, message: "Data saved successfully." };
  } catch (error) {
    console.error("Failed to save session data:", error);
    return { success: false, message: "Failed to save data." };
  }
}

export async function saveInteraction(sessionId: string, data: SessionData) {
  if (!data) {
    return { success: false, message: "No data to save." };
  }

  try {
    const documentData = {
      ...data,
      sessionId,
    };

    const success = await postToGoogleSheets({
      table: 'sessions',
      data: documentData,
    });
    if (!success) throw new Error("Google Sheets webhook save failed");

    return { success: true, message: "Interaction saved." };
  } catch (error) {
    console.error("Failed to save interaction:", error);
    return { success: false, message: "Failed to save interaction." };
  }
}
