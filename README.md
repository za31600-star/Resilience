# Resilience Learning Hub - Online (React + Firebase + Google Sheets via Apps Script)

This project is a ready-to-run React (Vite) prototype that:
- Uses Firebase Authentication (Google Sign-In) for login.
- Stores/reads journal entries from a Google Sheet via a Google Apps Script Web App endpoint.
- TailwindCSS used for styling; Framer Motion for simple animations.

## Quick setup (local)

1. Install dependencies:
   ```
   npm install
   ```

2. Place school logo:
   - Copy your logo file to `public/logo-sman1tibawa.png`.

3. Configure Firebase:
   - Create a Firebase project and enable **Google** sign-in.
   - Replace placeholders in `src/firebase.js` with your Firebase config.

4. Deploy Google Apps Script to access Google Sheets:
   - Create a Google Sheet (headers: timestamp, user, text).
   - Open **Extensions → Apps Script** and paste the script below.
   - Deploy → New Deployment → Select type 'Web App', execute as 'Me', access 'Anyone'.
   - Copy the Web App URL and set `GAS_ENDPOINT` in `src/App.jsx`.

### Google Apps Script (paste into Apps Script editor)
```javascript
const SHEET_NAME = 'Sheet1';

function doGet(e){
  const action = e.parameter.action;
  if(action === 'list'){
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_NAME);
    const data = sh.getDataRange().getValues();
    const rows = data.slice(1).map(r => ({ timestamp: r[0], user: r[1], text: r[2] }));
    return ContentService.createTextOutput(JSON.stringify({ entries: rows })).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput(JSON.stringify({ error: 'no action' })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e){
  const lock = LockService.getScriptLock();
  try{
    lock.waitLock(30000);
    const obj = JSON.parse(e.postData.contents);
    if(obj.action === 'append'){
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sh = ss.getSheetByName(SHEET_NAME);
      sh.appendRow([obj.timestamp, obj.user, obj.text]);
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ success:false, message:'unknown action' })).setMimeType(ContentService.MimeType.JSON);
  }finally{
    try{ lock.releaseLock(); }catch(e){}
  }
}
```

5. Run locally:
   ```
   npm run dev
   ```
   Open `http://localhost:5173` (or the port Vite indicates).

## Deployment notes
- For production hosting use Vercel/Netlify/Cloudflare Pages.
- Keep your Firebase config safe; Firebase client config keys are okay in frontend but secure backend rules for sensitive operations.
- The Google Apps Script runs with your Google account permissions — set access appropriately.

## Files included
- `src/` - React source
- `public/` - static files (logo)
- `package.json`, `tailwind.config.cjs`, `postcss.config.cjs`

If you'd like, I can:
- Build this into a ZIP and provide it for download.
- Also deploy the Apps Script for you (I cannot—needs your Google account).
- Or create a small Firebase function to act as a more secure proxy for Google Sheets.

