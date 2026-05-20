# FORGE — Power Hypertrophy System

A Progressive Web App (PWA) workout planner and tracker for the PH-PPL (Power/Hypertrophy Push-Pull-Legs) program.

## Setup

### 1. Add your images
Place all exercise images and the logo in the `images/` folder:
- `forge-emblem.png` (app icon)
- All 33 exercise images (`bb-flat-bench.png`, `bb-overhead-press.png`, etc.)

### 2. Deploy to GitHub Pages
1. Create a new GitHub repository
2. Push all files to the `main` branch
3. Go to Settings → Pages → Source: Deploy from `main` branch
4. Your app will be live at `https://yourusername.github.io/forge/`

### 3. Install on your phone
1. Open the URL in Safari (iOS) or Chrome (Android)
2. Tap "Add to Home Screen"
3. The app icon will appear on your home screen

### 4. Google Sheets sync (optional)
1. Create a new Google Sheet
2. Open Extensions → Apps Script
3. Paste the Google Apps Script code (see below)
4. Deploy as Web App
5. Copy the URL and paste it into FORGE Settings

### Google Apps Script

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  
  data.rows.forEach(row => {
    sheet.appendRow([
      row.date,
      row.day,
      row.exercise,
      row.set,
      row.weight,
      row.reps,
      row.display
    ]);
  });
  
  return ContentService.createTextOutput('OK');
}
```

## File Structure
```
forge/
├── index.html          Main app shell
├── manifest.json       PWA manifest
├── sw.js              Service worker (offline support)
├── css/
│   └── styles.css     All styling
├── js/
│   ├── data.js        Exercise program config (edit this to change exercises)
│   └── app.js         Application logic
└── images/            Exercise images and logo
```

## Modifying Exercises
Edit `js/data.js` only. All exercises, tips, video links, and program structure live in this single file. No other code changes needed.
