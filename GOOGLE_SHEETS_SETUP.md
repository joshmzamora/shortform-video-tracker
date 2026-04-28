# Google Sheets Webhook Setup

This project now supports writing experiment data to Google Sheets through a Google Apps Script webhook instead of Appwrite.

## 1. Create the spreadsheet

Create one Google Sheet with these tabs:

- `consents`
- `questionnaires`
- `sessions`

Add a header row to each tab.

Recommended headers:

### `consents`

`timestamp | participantId | participantName | parentalConsentAgreed | agreed | isHighSchoolStudent | isAnonymous`

### `questionnaires`

`timestamp | participantId | answers | screenTime | shortFormPercentage | screenTimeScreenshot`

### `sessions`

`timestamp | sessionId | participantId | type | videoId | interactionType | watchTimeMs | videoDurationMs | genre | events`

## 2. Add the Apps Script

In the sheet, open `Extensions -> Apps Script` and replace the default file with this:

```javascript
const SECRET = 'replace-this-with-your-own-long-random-secret';

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');

    if (body.secret !== SECRET) {
      return jsonResponse({ success: false, message: 'Unauthorized' }, 401);
    }

    const table = body.table;
    const data = body.data || {};

    if (!table) {
      return jsonResponse({ success: false, message: 'Missing table' }, 400);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(table);
    if (!sheet) {
      return jsonResponse({ success: false, message: `Sheet not found: ${table}` }, 404);
    }

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const row = headers.map((header) => {
      const value = data[header];
      if (value === undefined || value === null) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return value;
    });

    sheet.appendRow(row);

    return jsonResponse({ success: true });
  } catch (error) {
    return jsonResponse({ success: false, message: String(error) }, 500);
  }
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 3. Deploy the web app

1. Click `Deploy -> New deployment`
2. Choose `Web app`
3. Execute as: `Me`
4. Who has access: `Anyone`
   If your school account blocks this, use whatever external access option your Google Workspace allows.
5. Copy the web app URL

## 4. Add environment variables

Put these in `.env`:

```env
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/your-deployment-id/exec
GOOGLE_APPS_SCRIPT_SECRET=replace-this-with-the-same-secret-from-apps-script
```

## 5. Restart the app

Restart `npm run dev` after updating `.env`.

## Notes

- User-facing writes now go to Google Sheets through the webhook.
- The current admin dashboard still reads from Appwrite and has not been migrated in this pass.
- If you want the admin dashboard moved to Sheets too, that can be done next.
