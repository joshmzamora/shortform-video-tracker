# Appwrite Migration Guide

This document outlines the migration from Supabase to Appwrite, the schema definitions for the new Appwrite "Tables" (Collections), and setup instructions.

## 1. Migration Overview

All backend data interactions have been migrated to Appwrite. The term "Tables" is used within the codebase to refer to Appwrite Collections, as requested.

### Key Changes
- Replaced Supabase Client with `AppwriteService` (`src/lib/appwrite.ts`).
- Renamed code references from `Collections` to `Tables`.
- Implemented automatic schema initialization (Database, Collections, and Attributes).

## 2. Table Structure Definition

The following schemas are automatically created by the application when it initializes.

### Database ID: `tracker_db`

### Table: `consents`
Stores participant consent forms.

| Attribute Name | Type | Required | Size | Description |
|---|---|---|---|---|
| `participantId` | String | Yes | 255 | Unique identifier for the participant. |
| `participantName` | String | Yes | 255 | Name of the participant. |
| `agreed` | Boolean | Yes | - | Whether the participant agreed to the study. |
| `parentalConsentAgreed` | Boolean | Yes | - | Whether parental consent was obtained (if applicable). |
| `timestamp` | String | Yes | 64 | ISO timestamp of the consent. |

### Table: `questionnaires`
Stores responses to the pre/post-study questionnaire.

| Attribute Name | Type | Required | Size | Description |
|---|---|---|---|---|
| `participantId` | String | Yes | 255 | Unique identifier for the participant. |
| `answers` | String | Yes | 10000 | JSON string containing key-value pairs of questions and answers. |
| `timestamp` | String | Yes | 64 | ISO timestamp of the submission. |

### Table: `sessions`
Stores video interaction events and session backups.

| Attribute Name | Type | Required | Size | Description |
|---|---|---|---|---|
| `participantId` | String | Yes | 255 | Unique identifier for the participant. |
| `timestamp` | String | Yes | 64 | ISO timestamp of the event. |
| `type` | String | No | 64 | Record type (e.g., 'full_session_backup' or undefined for interactions). |
| `videoId` | String | No | 255 | ID of the video interacted with. |
| `interactionType` | String | No | 64 | Type of interaction (view, like, skip, etc.). |
| `watchTimeMs` | Integer | No | - | Duration watched in milliseconds. |
| `genre` | String | No | 64 | Genre of the video. |
| `events` | String | No | 1000000 | JSON string containing the full array of session events (for backups). |

## 3. Setup Instructions

### Prerequisites
1.  **Appwrite Instance**: You need a running Appwrite instance (Cloud or Self-Hosted).
2.  **Project**: Create a new Project in Appwrite Console.
3.  **API Key**: Create an API Key with the following scopes:
    - `documents.read`
    - `documents.write`
    - `collections.read`
    - `collections.write`
    - `databases.read`
    - `databases.write`
    - `attributes.read`
    - `attributes.write`
    - `indexes.read`
    - `indexes.write`

### Environment Variables
Create or update your `.env.local` file with the following credentials:

```bash
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1 # Or your self-hosted endpoint
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key_with_secret_scopes
```

### Auto-Initialization
The application is designed to automatically create the Database, Tables (Collections), and Attributes upon the first run of the `AppwriteService` (server-side).

1.  Start the development server: `npm run dev`.
2.  Navigate to the application.
3.  Check your Appwrite Console; you should see the `tracker_db` database and the three collections created with the correct attributes.

## 4. Authentication & Storage
- **Authentication**: This application currently uses anonymous session tracking via `participantId`. No User Authentication migration was required as Supabase Auth was not utilized for participants.
- **Storage**: Video files are currently served from the local `public/videos` directory. If you wish to migrate these to Appwrite Storage, upload them to an Appwrite Bucket and update `src/app/session/actions.ts` to fetch the list from Appwrite Storage API.

## 5. Verification
To verify the migration:
1.  **Consent**: Complete the consent form. Check the `consents` table in Appwrite.
2.  **Questionnaire**: Submit a questionnaire. Check the `questionnaires` table.
3.  **Session**: Watch a video. Check the `sessions` table for interaction events.
