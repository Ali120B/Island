"use strict";
const { app, BrowserWindow, screen, ipcMain, shell, Tray, Menu, nativeImage, clipboard, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("node:path");
const fs = require("fs");
const http = require("node:http");
const { exec } = require('child_process');

// Disable autoplay restrictions
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

// Setup
let tray = null;
let mainWindow = null;
let settingsWindow = null;
let updateDownloadedInfo = null;

const getIslandDocumentsDir = () => {
  const docsDir = path.join(app.getPath('documents'), 'Island');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  return docsDir;
};

const getSettingsPath = () => path.join(getIslandDocumentsDir(), 'settings.json');
const getCalendarEventsPath = () => path.join(getIslandDocumentsDir(), 'calendar-events.json');
const getGoogleTokenPath = () => path.join(getIslandDocumentsDir(), 'google-calendar-token.json');

const readSettings = () => {
  try {
    const settingsPath = getSettingsPath();
    if (!fs.existsSync(settingsPath)) return {};
    return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch (err) {
    console.error('[Main] Failed to read settings:', err);
    return {};
  }
};

const readCalendarEvents = () => {
  try {
    const eventsPath = getCalendarEventsPath();
    if (!fs.existsSync(eventsPath)) return {};
    return JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
  } catch (err) {
    console.error('[Main] Failed to read calendar events:', err);
    return {};
  }
};

const writeCalendarEvents = (events) => {
  try {
    fs.writeFileSync(getCalendarEventsPath(), JSON.stringify(events, null, 2));
    return true;
  } catch (err) {
    console.error('[Main] Failed to write calendar events:', err);
    return false;
  }
};

ipcMain.handle('get-update-status', () => {
  return updateDownloadedInfo;
});

ipcMain.handle('set-ignore-mouse-events', (event, ignore, forward) => {
  if (mainWindow) {
    mainWindow.setIgnoreMouseEvents(ignore, { forward: forward || false });
  }
});

ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url);
});

ipcMain.handle('google-calendar-connect', async () => {
  try {
    const settings = readSettings();
    const clientId = settings['google-calendar-client-id'];
    const clientSecret = settings['google-calendar-client-secret'];

    if (!clientId || !clientSecret) {
      return {
        success: false,
        error: 'Missing Google OAuth Client ID/Secret. Add them in Settings first.'
      };
    }

    const authCode = await new Promise((resolve, reject) => {
      const server = http.createServer((req, res) => {
        try {
          const url = new URL(req.url, 'http://127.0.0.1');
          const code = url.searchParams.get('code');
          const error = url.searchParams.get('error');

          if (error) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('<h3>Google Calendar connection failed. You can close this tab.</h3>');
            server.close();
            reject(new Error(error));
            return;
          }

          if (code) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('<h3>Google Calendar connected. You can close this tab.</h3>');
            server.close();
            resolve(code);
            return;
          }

          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end('<h3>Invalid callback request.</h3>');
        } catch (err) {
          reject(err);
        }
      });

      server.listen(0, '127.0.0.1', async () => {
        const { port } = server.address();
        const redirectUri = `http://127.0.0.1:${port}`;
        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.set('client_id', clientId);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/calendar.readonly');
        authUrl.searchParams.set('access_type', 'offline');
        authUrl.searchParams.set('prompt', 'consent');

        settings['google-calendar-redirect-uri'] = redirectUri;
        fs.writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2));

        await shell.openExternal(authUrl.toString());
      });

      setTimeout(() => {
        try { server.close(); } catch { }
        reject(new Error('Timed out waiting for Google authorization.'));
      }, 180000);
    });

    const settingsAfterAuth = readSettings();
    const redirectUri = settingsAfterAuth['google-calendar-redirect-uri'];
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: authCode,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      return { success: false, error: tokenData?.error_description || tokenData?.error || 'Failed to exchange auth code.' };
    }

    const expiresAt = Date.now() + ((tokenData.expires_in || 3600) * 1000);
    fs.writeFileSync(getGoogleTokenPath(), JSON.stringify({ ...tokenData, expires_at: expiresAt }, null, 2));

    return { success: true };
  } catch (err) {
    console.error('[Main] Google calendar connect failed:', err);
    return { success: false, error: err.message || 'Google Calendar connection failed.' };
  }
});

ipcMain.handle('google-calendar-disconnect', async () => {
  try {
    const tokenPath = getGoogleTokenPath();
    if (fs.existsSync(tokenPath)) fs.unlinkSync(tokenPath);
    return { success: true };
  } catch (err) {
    console.error('[Main] Google calendar disconnect failed:', err);
    return { success: false, error: err.message || 'Failed to disconnect Google Calendar.' };
  }
});

ipcMain.handle('google-calendar-status', async () => {
  return { connected: fs.existsSync(getGoogleTokenPath()) };
});

ipcMain.handle('google-calendar-sync', async () => {
  try {
    const settings = readSettings();
    const clientId = settings['google-calendar-client-id'];
    const clientSecret = settings['google-calendar-client-secret'];
    const redirectUri = settings['google-calendar-redirect-uri'];
    const tokenPath = getGoogleTokenPath();

    if (!fs.existsSync(tokenPath)) {
      return { success: false, error: 'Google Calendar is not connected.' };
    }

    const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    let accessToken = tokenData.access_token;

    if (!accessToken || (tokenData.expires_at && Date.now() > tokenData.expires_at - 30000)) {
      if (!tokenData.refresh_token) {
        return { success: false, error: 'Google token expired and no refresh token was found. Reconnect required.' };
      }

      const refreshed = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: tokenData.refresh_token,
          grant_type: 'refresh_token',
          redirect_uri: redirectUri
        })
      });

      const refreshData = await refreshed.json();
      if (!refreshed.ok) {
        return { success: false, error: refreshData?.error_description || 'Failed to refresh Google token.' };
      }

      accessToken = refreshData.access_token;
      const updated = {
        ...tokenData,
        ...refreshData,
        refresh_token: tokenData.refresh_token,
        expires_at: Date.now() + ((refreshData.expires_in || 3600) * 1000)
      };
      fs.writeFileSync(tokenPath, JSON.stringify(updated, null, 2));
    }

    const nowIso = new Date().toISOString();
    const eventsRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(nowIso)}&maxResults=20`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const eventsData = await eventsRes.json();
    if (!eventsRes.ok) {
      return { success: false, error: eventsData?.error?.message || 'Failed to fetch Google Calendar events.' };
    }

    const groupedGoogleEvents = {};
    for (const ev of (eventsData.items || [])) {
      const startDateTime = ev?.start?.dateTime || '';
      const startDate = ev?.start?.date || '';
      const isoDate = (startDateTime || startDate || '').slice(0, 10);
      if (!isoDate) continue;

      let time = '';
      if (startDateTime) {
        const dt = new Date(startDateTime);
        if (!Number.isNaN(dt.getTime())) {
          time = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}:00`;
        }
      }

      if (!groupedGoogleEvents[isoDate]) groupedGoogleEvents[isoDate] = [];
      groupedGoogleEvents[isoDate].push({
        id: `google:${ev.id}`,
        text: ev.summary || 'Untitled Google event',
        time,
        source: 'google',
        googleEventId: ev.id
      });
    }

    const existing = readCalendarEvents();
    const merged = {};

    for (const [dateKey, events] of Object.entries(existing)) {
      const keep = (Array.isArray(events) ? events : []).filter((eventItem) => eventItem?.source !== 'google');
      if (keep.length > 0) merged[dateKey] = keep;
    }

    for (const [dateKey, events] of Object.entries(groupedGoogleEvents)) {
      const existingList = Array.isArray(merged[dateKey]) ? merged[dateKey] : [];
      merged[dateKey] = [...existingList, ...events];
    }

    const success = writeCalendarEvents(merged);
    return { success, imported: Object.values(groupedGoogleEvents).reduce((sum, list) => sum + list.length, 0) };
  } catch (err) {
    console.error('[Main] Google calendar sync failed:', err);
    return { success: false, error: err.message || 'Google Calendar sync failed.' };
  }
});

const getIconPath = () => {
  try {
    const ext = 'png';
    const iconName = `icon.${ext}`;

    // 1. Check packaged resources
    if (app.isPackaged) {
      const resPath = path.join(process.resourcesPath, iconName);
      if (fs.existsSync(resPath)) return resPath;

      const assetsPath = path.join(process.resourcesPath, 'assets', 'icons', iconName);
      if (fs.existsSync(assetsPath)) return assetsPath;
    }

    // 2. Check development paths relative to app root
    const rootPath = app.getAppPath();
    const devPaths = [
      path.join(rootPath, 'src', 'assets', 'icons', iconName),
      path.join(rootPath, 'assets', 'icons', iconName),
      path.join(__dirname, 'assets', 'icons', iconName),
      path.join(__dirname, '..', 'src', 'assets', 'icons', iconName)
    ];

    for (const p of devPaths) {
      try {
        if (fs.existsSync(p)) return p;
      } catch (e) {
        console.error(`[Main] Error checking path ${p}:`, e);
      }
    }
  } catch (err) {
    console.error('[Main] Error in getIconPath:', err);
  }

  return undefined;
};



const createWindow = () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.size;

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    backgroundColor: "#00000000",
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    frame: false,
    thickFrame: false,
    hasShadow: false,
    skipTaskbar: true,
    icon: getIconPath(),
    hiddenInMissionControl: true,
    type: 'toolbar',
    fullscreen: false,
    visibleOnFullScreen: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      devTools: false,
      webviewTag: true
    },
    show: false,
    // type: 'toolbar', // Commenting out to test visibility
    // focusable: false // Commenting out to test visibility
  });

  // Force always on top with high priority
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  mainWindow.setFullScreen(true);

  // Mouse events are handled via IPC now, but initial state:
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  const showDelay = 0;

  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    }, showDelay);
  });

  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
      mainWindow.focus();
    }
  }, 5000);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  try {
    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  } catch (_) {
  }

  if (!app.isPackaged || process.env.NODE_ENV === 'development') {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    const rendererPath = path.join(__dirname, "../renderer/main_window/index.html");
    mainWindow.loadFile(rendererPath);
  }
};

const createSettingsWindow = () => {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 500,
    height: 600,
    title: "Island Settings",
    autoHideMenuBar: true,
    icon: getIconPath(),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  if (!app.isPackaged || process.env.NODE_ENV === 'development') {
    settingsWindow.loadURL("http://localhost:5173/settings.html");
  } else {
    // Correctly handling the path for packaged app or production build
    const settingsPath = path.join(__dirname, "../renderer/main_window/settings.html");
    settingsWindow.loadFile(settingsPath);
  }

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
};

app.whenReady().then(() => {
  if (!app.requestSingleInstanceLock()) {
    dialog.showErrorBox('Island is already running', 'Another instance of Island is already running. Please close it first.');
    app.quit();
    return;
  }

  createWindow();
  
  // Setup Auto-Updater
  if (app.isPackaged) {
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    
    // Configure GitHub provider explicitly (optional but safer)
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'Ali120B',
      repo: 'Island'
    });

    autoUpdater.checkForUpdatesAndNotify();
    
    // Check for updates every hour
    setInterval(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 60 * 60 * 1000);

    autoUpdater.on('update-available', (info) => {
      console.log('[Updater] Update available:', info.version);
      if (settingsWindow) settingsWindow.webContents.send('update-available', info.version);
      if (mainWindow) mainWindow.webContents.send('update-available', info.version);
    });

    autoUpdater.on('update-downloaded', (info) => {
      console.log('[Updater] Update downloaded:', info.version);
      updateDownloadedInfo = info;
      if (settingsWindow) settingsWindow.webContents.send('update-downloaded', info.version);
      if (mainWindow) mainWindow.webContents.send('update-downloaded', info.version);
      
      // Removed dialog message box as per request to use in-app banner
    });

    autoUpdater.on('error', (err) => {
      console.error('[Updater] Error:', err);
    });
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  try {
    const iconPath = getIconPath();
    let trayIcon;
    if (iconPath && fs.existsSync(iconPath)) {
      const icon = nativeImage.createFromPath(iconPath);
      trayIcon = icon.resize({ width: 16, height: 16 });
    } else {
      // Fallback if no icon found
      trayIcon = nativeImage.createEmpty();
    }

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show/Hide Island',
        click: () => {
          if (mainWindow) {
            if (mainWindow.isVisible()) {
              mainWindow.hide();
            } else {
              mainWindow.show();
            }
          }
        }
      },
      {
        label: 'Settings',
        click: () => {
          createSettingsWindow();
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.quit();
        }
      }
    ]);

    tray = new Tray(trayIcon);
    tray.setToolTip('Island');
    tray.setContextMenu(contextMenu);
  } catch (e) {
    console.error('Failed to create tray:', e);
  }
});

ipcMain.on('open-settings', () => {
  createSettingsWindow();
});

ipcMain.on('quit-and-install', () => {
  autoUpdater.quitAndInstall(false, true);
});

ipcMain.on('hide-island', () => {
  try {
    if (mainWindow) mainWindow.hide();
  } catch (err) {
    console.error('[Main] Failed to hide island:', err);
  }
});

ipcMain.on('quit-app', () => {
  try {
    app.quit();
  } catch (err) {
    console.error('[Main] Failed to quit app:', err);
  }
});

ipcMain.handle('save-settings', async (event, settings) => {
  try {
    fs.writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2));
    return true;
  } catch (err) {
    console.error("Error saving settings:", err);
    return false;
  }
});

ipcMain.handle('get-settings', async () => {
  return readSettings();
});

ipcMain.handle('change-volume', (event, direction) => {
  const key = direction === 'up' ? '[char]175' : '[char]174';
  const script = `(New-Object -ComObject WScript.Shell).SendKeys(${key})`;
  exec(`powershell -NoProfile -Command "${script}"`);
  return null;
});

ipcMain.handle('change-brightness', (event, direction) => {
  return new Promise((resolve) => {
    const increment = direction === 'up' ? 10 : -10;
    const psScript = `
$ErrorActionPreference = 'Stop'
$brightness = (Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightness).CurrentBrightness
$newBrightness = $brightness + ${increment}
if ($newBrightness -gt 100) { $newBrightness = 100 }
if ($newBrightness -lt 0) { $newBrightness = 0 }
(Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightnessMethods).WmiSetBrightness(1, $newBrightness) | Out-Null
Write-Output $newBrightness
`;

    const tempPath = path.join(app.getPath('userData'), 'brightness-script.ps1');

    try {
      fs.writeFileSync(tempPath, psScript);
    } catch (e) {
      console.error('[Main] Failed to write brightness script:', e);
      return resolve(null);
    }

    exec(`powershell -NoProfile -ExecutionPolicy Bypass -File "${tempPath}"`, { timeout: 6000 }, (err, stdout, stderr) => {
      try { fs.unlinkSync(tempPath); } catch { }

      if (err) {
        console.error('[Main] change-brightness failed:', err.message);
        if (stderr) console.error('[Main] change-brightness stderr:', stderr);
        return resolve(null);
      }
      const n = Number(String(stdout).trim());
      resolve(Number.isFinite(n) ? n : null);
    });
  });
});

ipcMain.handle('save-todo', async (event, todos) => {
  try {
    const docsDir = path.join(app.getPath('documents'), 'Island');
    if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
    const todoPath = path.join(docsDir, 'todo.json');
    fs.writeFileSync(todoPath, JSON.stringify(todos, null, 2));
    return true;
  } catch (err) {
    console.error("Error saving todo:", err);
    return false;
  }
});

ipcMain.handle('get-todo', async () => {
  try {
    const todoPath = path.join(app.getPath('documents'), 'Island', 'todo.json');
    if (fs.existsSync(todoPath)) {
      const data = fs.readFileSync(todoPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error getting todo:", err);
  }
  return [];
});

ipcMain.handle('get-calendar-events', async () => {
  return readCalendarEvents();
});

ipcMain.handle('save-calendar-events', async (event, events) => {
  return writeCalendarEvents(events);
});

ipcMain.handle('log', (event, message) => {
  console.log(`[Renderer]: ${message}`);
});

ipcMain.handle('get-system-media', async () => {
  return new Promise((resolve) => {
    // PowerShell script using proper AsTask pattern for WinRT async
    const psScript = `
$ErrorActionPreference = 'Stop'
try {
    # Load WinRT assemblies
    Add-Type -AssemblyName System.Runtime.WindowsRuntime
    [void][Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager,Windows.Media.Control,ContentType=WindowsRuntime]
    
    # Helper function to convert WinRT async to .NET Task
    $asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { 
        $_.Name -eq 'AsTask' -and 
        $_.GetParameters().Count -eq 1 -and 
        $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation\`1' 
    })[0]
    
    function Await($WinRtTask, $ResultType) {
        $asTask = $asTaskGeneric.MakeGenericMethod($ResultType)
        $netTask = $asTask.Invoke($null, @($WinRtTask))
        $netTask.Wait(-1) | Out-Null
        return $netTask.Result
    }
    
    # Get the session manager
    $asyncOp = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager]::RequestAsync()
    $manager = Await $asyncOp ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager])
    
    if (-not $manager) { Write-Output 'null'; exit 0 }
    
    # Find a playing session
    $sessions = $manager.GetSessions()
    $session = $null
    foreach ($s in $sessions) {
        $pb = $s.GetPlaybackInfo()
        if ($pb.PlaybackStatus -eq 'Playing') { $session = $s; break }
    }
    if (-not $session) { $session = $manager.GetCurrentSession() }
    if (-not $session) { Write-Output 'null'; exit 0 }
    
    # Get media properties
    $propsAsync = $session.TryGetMediaPropertiesAsync()
    $props = Await $propsAsync ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionMediaProperties])
    $pb = $session.GetPlaybackInfo()
    
    @{
        Title = if($props.Title) { $props.Title } else { 'Unknown' }
        Artist = if($props.Artist) { $props.Artist } else { '' }
        Album = if($props.AlbumTitle) { $props.AlbumTitle } else { '' }
        Status = $pb.PlaybackStatus.ToString().ToLower()
        Source = $session.SourceAppUserModelId
    } | ConvertTo-Json -Compress
} catch {
    Write-Host "PS Error: $_"
    Write-Output 'null'
}
`;

    const tempPath = path.join(app.getPath('userData'), 'media-script.ps1');

    try {
      fs.writeFileSync(tempPath, psScript);
    } catch (e) {
      console.error("[Media] Failed to write script:", e);
      return resolve(null);
    }

    // Try PowerShell 7 first (pwsh), fall back to PowerShell 5 (powershell)
    const tryPwsh = (callback) => {
      exec('pwsh -Version', { timeout: 2000 }, (err) => {
        callback(!err);
      });
    };

    const runScript = (usePwsh) => {
      const shell = usePwsh ? 'pwsh' : 'powershell';
      console.log(`[Media] Using ${shell}...`);

      exec(`${shell} -NoProfile -ExecutionPolicy Bypass -File "${tempPath}"`, { timeout: 8000 }, (error, stdout, stderr) => {
        try { fs.unlinkSync(tempPath); } catch { }

        if (stderr) console.log("[Media] Stderr:", stderr);
        if (stdout) console.log("[Media] Output:", stdout.trim().substring(0, 150));

        if (error) {
          console.error("[Media] Error:", error.message);
          return resolve(null);
        }

        try {
          const output = stdout.trim();
          const lines = output.split('\n');
          const jsonLine = lines.find(l => l.trim().startsWith('{'));

          if (!jsonLine || jsonLine === 'null') {
            console.log("[Media] No session found");
            return resolve(null);
          }

          const data = JSON.parse(jsonLine);
          console.log("[Media] Found:", data.Title, "-", data.Artist);

          let sourceName = data.Source || 'System';
          if (sourceName.includes('.')) sourceName = sourceName.split('.')[0];

          resolve({
            name: data.Title || "Unknown Title",
            artist: data.Artist || "Unknown Artist",
            album: data.Album || "",
            state: data.Status === 'playing' ? 'playing' : 'paused',
            source: sourceName,
            artwork_url: null
          });
        } catch (e) {
          console.error("[Media] Parse error:", e.message);
          resolve(null);
        }
      });
    };

    tryPwsh((hasPwsh) => runScript(hasPwsh));
  });
});



app.on("window-all-closed", () => {
  // Always quit when window is closed on Windows
  app.quit();
});

// System Media Controls Handler
// System media controls removed to prevent powershell lag.
// Use Spotify-specific logic in renderer if needed.

ipcMain.handle('write-files-to-clipboard', (event, filePaths) => {
  if (!filePaths || !Array.isArray(filePaths)) return;

  // Filter for valid strings only
  const validPaths = filePaths.filter(p => typeof p === 'string' && p.length > 0);

  if (validPaths.length === 0) {
    console.log(`[Main]: No valid paths to write.`);
    return;
  }

  // Ensure paths use Windows backslashes for the clipboard to be recognized by Explorer
  const normalizedPaths = validPaths.map(p => path.win32.normalize(p));

  console.log(`[Main]: WRITING TO CLIPBOARD (filenames only):`, normalizedPaths);
  try {
    clipboard.clear();
    // Providing 'text' alongside 'filenames' often forces Explorer to see it as text only.
    // Removing text property to ensure it's treated as a File list.
    clipboard.write({
      filenames: normalizedPaths
    });
  } catch (err) {
    console.error(`[Main]: Clipboard error:`, err);
  }
});

// --- Dropbox File Operations (Removed temp folder logic) ---


// --- Drag and Drop Out ---
ipcMain.on('ondragstart', (event, filePath) => {
  console.log(`[Main] Attempting dragstart for: ${filePath}`);
  if (fs.existsSync(filePath)) {
    const iconPath = getIconPath();
    let icon;
    if (iconPath && fs.existsSync(iconPath)) {
      icon = nativeImage.createFromPath(iconPath);
      if (!icon.isEmpty()) {
        icon = icon.resize({ width: 32, height: 32 });
      } else {
        icon = undefined;
      }
    }

    const normalizedPath = path.resolve(filePath);
    console.log(`[Main] Starting OS drag for REAL file: ${normalizedPath}`);

    try {
      if (!fs.existsSync(normalizedPath)) {
        throw new Error(`File not found: ${normalizedPath}`);
      }

      // Use the actual file's icon from the OS for a better experience
      app.getFileIcon(normalizedPath, { size: 'normal' }).then(dragIcon => {
        const win = BrowserWindow.fromWebContents(event.sender);

        // TEMPORARILY disable mouse events and lower priority so the OS can "see" the desktop
        if (win) {
          win.setIgnoreMouseEvents(true, { forward: false });
          // Lowering from 'screen-saver' to 'floating' during drag helps OS interaction
          win.setAlwaysOnTop(true, 'floating');
        }

        event.sender.startDrag({
          file: normalizedPath,
          icon: dragIcon
        });

        console.log(`[Main] OS acknowledged REAL file drag for: ${normalizedPath}`);

        // Listen for drag-end to restore window state
        event.sender.once('drag-end', () => {
          console.log(`[Main] Drag ended for: ${normalizedPath}`);
          if (win && !win.isDestroyed()) {
            win.setAlwaysOnTop(true, 'screen-saver');
            win.setIgnoreMouseEvents(false);
          }
          event.sender.send('drag-finished', filePath);
        });
      }).catch(err => {
        console.error(`[Main] Error getting file icon:`, err);
        // Fallback to app icon or empty
        const iconPath = getIconPath();
        const fallbackIcon = (iconPath && fs.existsSync(iconPath))
          ? nativeImage.createFromPath(iconPath).resize({ width: 32, height: 32 })
          : nativeImage.createEmpty();

        const win = BrowserWindow.fromWebContents(event.sender);
        if (win) {
          win.setIgnoreMouseEvents(true, { forward: false });
          win.setAlwaysOnTop(true, 'floating');
        }

        event.sender.startDrag({
          file: normalizedPath,
          files: [normalizedPath],
          icon: fallbackIcon
        });

        if (win && !win.isDestroyed()) {
          win.setAlwaysOnTop(true, 'screen-saver');
          win.setIgnoreMouseEvents(false);
        }
        event.sender.send('drag-finished', filePath);
      });
    } catch (dragErr) {
      console.error(`[Main] Critical error during startDrag:`, dragErr);
    }
  } else {
    console.error(`[Main] File does not exist for drag: ${filePath}`);
  }
});

// --- AI Chat History ---
const getChatHistoryPath = () => {
  const historyDir = path.join(app.getPath('documents'), 'Island', 'ai_chats');
  if (!fs.existsSync(historyDir)) fs.mkdirSync(historyDir, { recursive: true });
  return path.join(historyDir, 'history.json');
};

ipcMain.handle('save-chat-history', async (event, session) => {
  try {
    const historyPath = getChatHistoryPath();
    let history = [];
    if (fs.existsSync(historyPath)) {
      try {
        const data = fs.readFileSync(historyPath, 'utf8');
        history = JSON.parse(data);
      } catch (e) {
        console.error("Error reading chat history:", e);
      }
    }

    const existingIndex = history.findIndex(h => h.id === session.id);
    if (existingIndex >= 0) {
      history[existingIndex] = {
        ...history[existingIndex],
        ...session,
        timestamp: Date.now() // Update timestamp to show as recent
      };
    } else {
      history.push({
        ...session,
        timestamp: Date.now()
      });
    }

    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
    return true;
  } catch (err) {
    console.error("Error saving chat history:", err);
    return false;
  }
});

ipcMain.handle('get-chat-history', async () => {
  try {
    const historyPath = getChatHistoryPath();
    if (fs.existsSync(historyPath)) {
      const data = fs.readFileSync(historyPath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (err) {
    console.error("Error getting chat history:", err);
    return [];
  }
});

ipcMain.handle('delete-chat-history-item', async (event, id) => {
  try {
    const historyPath = getChatHistoryPath();
    if (fs.existsSync(historyPath)) {
      const data = fs.readFileSync(historyPath, 'utf8');
      let history = JSON.parse(data);
      history = history.filter(item => item.id !== id);
      fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
      return true;
    }
    return false;
  } catch (err) {
    console.error("Error deleting chat history item:", err);
    return false;
  }
});

ipcMain.handle('clear-chat-history', async () => {
  try {
    const historyPath = getChatHistoryPath();
    if (fs.existsSync(historyPath)) {
      fs.unlinkSync(historyPath);
    }
    return true;
  } catch (err) {
    console.error("Error clearing chat history:", err);
    return false;
  }
});

// --- Clipboard History ---
let clipboardHistory = [];
const MAX_CLIPBOARD_ITEMS = 50;

const updateClipboardHistory = () => {
  const text = clipboard.readText();
  const image = clipboard.readImage();

  let newItem = null;

  if (!image.isEmpty()) {
    const dataUrl = image.toDataURL();
    // Check if image is already at the top to avoid duplicates
    if (clipboardHistory.length === 0 || clipboardHistory[0].content !== dataUrl) {
      newItem = { type: 'image', content: dataUrl, timestamp: Date.now() };
    }
  } else if (text && text.trim()) {
    if (clipboardHistory.length === 0 || clipboardHistory[0].content !== text) {
      newItem = { type: 'text', content: text, timestamp: Date.now() };
    }
  }

  if (newItem) {
    clipboardHistory.unshift(newItem);
    if (clipboardHistory.length > MAX_CLIPBOARD_ITEMS) {
      clipboardHistory.pop();
    }
    if (mainWindow) {
      mainWindow.webContents.send('clipboard-update', clipboardHistory);
    }
  }
};

// Poll clipboard every 1 second
setInterval(updateClipboardHistory, 1000);

ipcMain.handle('get-clipboard-history', () => {
  return clipboardHistory;
});

ipcMain.handle('copy-to-clipboard', (event, { type, content }) => {
  if (type === 'image') {
    const img = nativeImage.createFromDataURL(content);
    clipboard.writeImage(img);
  } else {
    clipboard.writeText(content);
  }
  // Immediately update history to reflect the new top item
  updateClipboardHistory();
  return true;
});

ipcMain.handle('clear-clipboard-history', () => {
  clipboardHistory = [];
  clipboard.clear(); // Clear the actual system clipboard
  if (mainWindow) {
    mainWindow.webContents.send('clipboard-update', clipboardHistory);
  }
  return true;
});

ipcMain.handle('delete-clipboard-item', (event, timestamp) => {
  const itemToDelete = clipboardHistory.find(item => item.timestamp === timestamp);
  if (itemToDelete) {
    // If we are deleting the item that is currently on the system clipboard, clear it
    const currentText = clipboard.readText();
    const currentImage = clipboard.readImage();

    let isCurrent = false;
    if (itemToDelete.type === 'text' && itemToDelete.content === currentText) {
      isCurrent = true;
    } else if (itemToDelete.type === 'image' && !currentImage.isEmpty()) {
      if (itemToDelete.content === currentImage.toDataURL()) {
        isCurrent = true;
      }
    }

    if (isCurrent) {
      clipboard.clear();
    }
  }

  clipboardHistory = clipboardHistory.filter(item => item.timestamp !== timestamp);
  if (mainWindow) {
    mainWindow.webContents.send('clipboard-update', clipboardHistory);
  }
  return true;
});
