# Video Organization and Data Schema

## Overview
This document outlines the new folder structure and file naming conventions for the `public/videos/education` directory. The goal is to standardize how educational videos and their associated metadata are stored, ensuring scalability and ease of access.

## Folder Structure

The new organization uses a **Video ID-based** structure. Each video resides in its own directory named after its unique ID (e.g., YouTube ID).

```
public/videos/education/
├── {video_id}/
│   ├── video.mp4           # The video file (standardized name)
│   ├── thumbnail.webp      # Video thumbnail
│   ├── description.txt     # Plain text description
│   ├── metadata.json       # Static metadata (title, channel, tags, etc.)
│   ├── comments.json       # Pre-loaded comments
│   └── results.json        # Aggregated session results/analytics
```

### File Details

#### `metadata.json`
Contains static information about the video.
```json
{
  "id": "khnkDjQnJmU",
  "title": "A Real Life Glitch in Thermodynamics",
  "channel": "Human Sparks",
  "uploadDate": "2024-01-01",
  "duration": 60,
  "originalUrl": "https://youtube.com/...",
  "tags": ["science", "physics"],
  "categories": ["Education"]
}
```

#### `results.json`
Stores aggregated analytics and session results for this specific video.
```json
{
  "totalViews": 0,
  "totalLikes": 0,
  "averageWatchTime": 0,
  "interactionHistory": [] 
}
```

#### `comments.json`
Array of comment objects associated with the video.
```json
[
  {
    "author": "User1",
    "text": "Great video!",
    "likes": 10,
    "timestamp": "..."
  }
]
```

## Session Results Strategy
Session results (user interactions) are primarily stored in the database (Appwrite) for real-time tracking. However, for analysis and caching purposes, aggregated results can be exported to the `results.json` file within each video's directory. This allows for:
1.  **Easy Correlation**: All data related to a video is in one place.
2.  **Portable Datasets**: The `public/videos/education` folder becomes a self-contained dataset.

## Migration
A migration script (`migrate-videos.ts`) was used to transform the legacy `public/videos/Educational` structure to this new schema.
- **Source**: `public/videos/Educational/{Channel}/{Title}/`
- **Destination**: `public/videos/education/{ID}/`

## Usage in Code
The application reads this structure via `src/app/session/actions.ts`. The `getVideos()` function scans the `education` directory and parses the `metadata.json` to populate the application's state.
