# Handoff Context

This file is for the next AI/engineer working on `shortform-video-tracker`.

## Project Summary

- This is a Next.js experiment app for an AP Research short-form video study.
- Main user flow:
  - `/` main menu
  - `/consent`
  - `/questionnaire`
  - `/start`
  - `/session`
- The current priority has been the experiment session flow, especially:
  - direct entry to the experiment
  - TikTok embed behavior
  - preventing invalid experiment runs
  - preserving the pre-merge UI the user preferred

## Current User Preferences / Decisions

- The user wanted the app visually restored to the older pre-merge version rather than the merged hybrid.
- `Experiment` should be clickable without requiring consent/questionnaire first.
- The start page should still show a warning dialog before the experiment begins.
- TikTok embeds should not be allowed to redirect the participant out of the experiment.
- Leaving the tab/window/app during the session should invalidate the experiment immediately.
- The invalidation UX should be a blocked screen, not a silent redirect or restart.
- The user asked for context to be written into a repo-local file so another AI can continue later.

## Current Experiment Behavior

### Start flow

File to read first:
- `src/app/start/page.tsx`

Current behavior:
- User enters a participant ID.
- Clicking `Start Experiment` opens an instruction dialog.
- The dialog includes a prominent warning that leaving the tab, switching windows/apps, or trying to open external pages will invalidate the experiment.

### Session flow

Files to read first:
- `src/app/session/page.tsx`
- `src/components/tiktok-player.tsx`
- `src/app/session/actions.ts`

Current behavior:
- Session loads TikTok-based videos from `public/videos/**.txt`.
- First couple videos are preconnected/prefetched.
- Unavailable TikTok embeds are detected and skipped.
- Up/down “elevator” buttons are styled to be more noticeable.
- The entire TikTok iframe is covered by a transparent shield so the participant cannot click into TikTok and get redirected.
- If the participant leaves the tab, switches windows/apps, or leaves the page, the session is invalidated immediately.
- Invalidated sessions show a blocked screen.

## Important Technical Notes

### TikTok source format

- `public/videos/*/*.txt` files store TikTok embed snippets.
- `src/app/session/actions.ts` parses the `cite="https://www.tiktok.com/.../video/{id}"` URLs.
- `src/components/tiktok-player.tsx` extracts the numeric TikTok video ID and uses the TikTok player iframe.

### Local video player

File:
- `src/components/video-player.tsx`

Notes:
- This file exists and is part of the old-style session/player work.
- It still has social-style controls and local-video interaction behavior.
- The recent lockdown work focused primarily on TikTok embeds, since redirect risk there was the big concern.

## Google Sheets Migration Status

The repo is now prepared for a full Google Sheets-backed setup, but the user has intentionally postponed actually turning it on.

Files involved:
- `src/lib/google-sheets-webhook.ts`
- `GOOGLE_SHEETS_SETUP.md`
- `src/app/consent/actions.ts`
- `src/app/questionnaire/actions.ts`
- `src/app/session/actions.ts`
- `src/app/consent/page.tsx`

What was done:
- A lightweight Google Apps Script webhook path was added.
- User-facing writes for consent/questionnaire/session were pointed at that helper.
- Admin reads were migrated to Google Sheets reads through the same Apps Script endpoint.
- A setup doc was created with both `doPost` and `doGet` Apps Script code and `.env` variables.
- Participant ID generation was changed away from Appwrite count-based generation to a local generated ID.
- Appwrite code and package usage were removed from the active service path.

Why it was paused:
- The user said they want to table the migration for now and revisit it later.

Important caution:
- This is now Google Sheets-first code, but it is not usable until the user deploys the Apps Script and fills in the environment variables.
- Admin data depends on the Apps Script `doGet` endpoint returning rows from `consents`, `questionnaires`, and `sessions`.
- The user said they are not turning it on yet, so treat the repo as “prepared but not activated.”

Read these first before resuming that work:
- `GOOGLE_SHEETS_SETUP.md`
- `src/lib/google-sheets-webhook.ts`
- `src/app/admin/actions.ts`

## Files With Highest Signal

- `src/app/start/page.tsx`
- `src/app/session/page.tsx`
- `src/components/tiktok-player.tsx`
- `src/components/video-player.tsx`
- `src/app/session/actions.ts`
- `src/app/consent/page.tsx`
- `src/app/consent/actions.ts`
- `src/lib/google-sheets-webhook.ts`
- `GOOGLE_SHEETS_SETUP.md`

## Recommended Next Steps

If continuing experiment UX work:
1. Verify the full session flow in browser:
   - start dialog
   - TikTok load behavior
   - invalidation on tab/window switch
   - unavailable-video skip behavior
2. Decide whether local video controls also need stricter lockdown behavior.
3. Implement the end-of-experiment success popup / redirect / “view results” option if still wanted.

If resuming persistence work:
1. Deploy the Apps Script from `GOOGLE_SHEETS_SETUP.md`.
2. Add `GOOGLE_APPS_SCRIPT_URL` and `GOOGLE_APPS_SCRIPT_SECRET` to `.env`.
3. Verify consent/questionnaire/session writes and admin reads against the live sheet.

## Verification Status

Most recent verified commands after the latest changes:

```bash
npm run typecheck
npm run build
```

These passed after:
- experiment lockdown changes
- TikTok redirect shielding
- invalidation flow
- Google Sheets webhook helper changes

## Environment Notes

- The app uses `.env`.
- The Google Sheets webhook path expects:
  - `GOOGLE_APPS_SCRIPT_URL`
  - `GOOGLE_APPS_SCRIPT_SECRET`
- If resuming that work, restart the dev server after editing `.env`.
