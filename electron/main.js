/**
 * electron/main.js — Electron main process for GLITCH·PEACE desktop build.
 *
 * Usage (development):  npx electron electron/main.js
 * Usage (production):   Built via `npm run electron:build` (electron-builder).
 *
 * Steam integration notes:
 *  - Greenworks (steamworks.js) can be dropped in later; the ipcMain handler
 *    below provides a ready stub for overlay and achievement calls.
 *  - Frame is hidden + custom title bar kept minimal to match the game's
 *    consciousness aesthetic.
 */

const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');

// ── Environment detection ────────────────────────────────────────────────
const isDev  = !app.isPackaged;
const VITE_DEV_SERVER = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

// ── Security: disable remote module, enable context isolation ─────────────
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

// ── Create main window ───────────────────────────────────────────────────
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#080610',   // match game background — avoids white flash
    title: 'GLITCH·PEACE',
    icon: isDev
      ? path.join(__dirname, '../public/favicon.ico')
      : path.join(process.resourcesPath, 'app/public/favicon.ico'),
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
      sandbox:          true,
    },
  });

  // Load the Vite dev server in development; the built index.html in production.
  if (isDev) {
    win.loadURL(VITE_DEV_SERVER);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Open external links in the OS browser instead of a new Electron window.
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// ── App lifecycle ────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // macOS: re-create window when dock icon is clicked and no windows are open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // On macOS the convention is to keep the app open until ⌘Q.
  if (process.platform !== 'darwin') app.quit();
});

// ── IPC: Steam overlay / achievement stubs ───────────────────────────────
// When Greenworks (steamworks.js) is available, replace these stubs with
// real Steamworks calls: steam.activateGameOverlay(), steam.setAchievement().
ipcMain.handle('steam:activateOverlay', (_event, dialogType = 'friends') => {
  console.log(`[Steam stub] activateGameOverlay('${dialogType}')`);
});

ipcMain.handle('steam:setAchievement', (_event, achievementId) => {
  console.log(`[Steam stub] setAchievement('${achievementId}')`);
});

ipcMain.handle('steam:getPersonaName', () => {
  return 'Player'; // replaced by greenworks.getPersonaName() when available
});
