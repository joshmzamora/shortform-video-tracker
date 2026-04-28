# Google Sheets Webhook Setup

This project is now set up to use Google Sheets through a Google Apps Script endpoint for both experiment writes and admin reads.

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

function doGet(e) {
  try {
    const secret = e.parameter.secret;
    const table = e.parameter.table;
    const participantId = e.parameter.participantId;

    if (secret !== SECRET) {
      return jsonResponse({ success: false, message: 'Unauthorized' });
    }

    if (!table) {
      return jsonResponse({ success: false, message: 'Missing table' });
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(table);
    if (!sheet) {
      return jsonResponse({ success: false, message: `Sheet not found: ${table}` });
    }

    const values = sheet.getDataRange().getValues();
    if (values.length <= 1) {
      return jsonResponse({ success: true, data: [] });
    }

    const headers = values[0];
    let rows = values.slice(1).map((row) => {
      const entry = {};
      headers.forEach((header, index) => {
        entry[header] = row[index];
      });
      return entry;
    });

    if (participantId) {
      rows = rows.filter((row) => String(row.participantId) === String(participantId));
    }

    return jsonResponse({ success: true, data: rows });
  } catch (error) {
    return jsonResponse({ success: false, message: String(error) });
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

- The app now expects Google Sheets to be the persistence layer for:
  - consent writes
  - questionnaire writes
  - session writes
  - admin reads
- The app is production-ready from the code side, but it will not actually work until you deploy the Apps Script and add the two environment variables.
- If the webhook env vars are missing, Sheets reads/writes will fail safely.
