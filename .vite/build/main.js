"use strict";const{app:d,BrowserWindow:M,screen:D,ipcMain:c,shell:T,Tray:R,Menu:_,nativeImage:S,clipboard:y,dialog:F}=require("electron"),{autoUpdater:m}=require("electron-updater"),u=require("node:path"),i=require("fs"),{exec:$}=require("child_process");d.commandLine.appendSwitch("autoplay-policy","no-user-gesture-required");let O=null,a=null,g=null,W=null;c.handle("get-update-status",()=>W);c.handle("set-ignore-mouse-events",(e,t,n)=>{a&&a.setIgnoreMouseEvents(t,{forward:n||!1})});c.handle("open-external",async(e,t)=>{await T.openExternal(t)});const P=()=>{try{const t="icon.png";if(d.isPackaged){const o=u.join(process.resourcesPath,t);if(i.existsSync(o))return o;const s=u.join(process.resourcesPath,"assets","icons",t);if(i.existsSync(s))return s}const n=d.getAppPath(),r=[u.join(n,"src","assets","icons",t),u.join(n,"assets","icons",t),u.join(__dirname,"assets","icons",t),u.join(__dirname,"..","src","assets","icons",t)];for(const o of r)try{if(i.existsSync(o))return o}catch(s){console.error(`[Main] Error checking path ${o}:`,s)}}catch(e){console.error("[Main] Error in getIconPath:",e)}},E=()=>{const e=D.getPrimaryDisplay(),{width:t,height:n}=e.size;a=new M({width:t,height:n,x:0,y:0,backgroundColor:"#00000000",transparent:!0,alwaysOnTop:!0,resizable:!1,frame:!1,thickFrame:!1,hasShadow:!1,skipTaskbar:!0,icon:P(),hiddenInMissionControl:!0,type:"toolbar",fullscreen:!1,visibleOnFullScreen:!0,webPreferences:{preload:u.join(__dirname,"preload.js"),devTools:!1},show:!1}),a.setAlwaysOnTop(!0,"screen-saver"),a.setVisibleOnAllWorkspaces(!0,{visibleOnFullScreen:!0}),a.setFullScreen(!0),a.setIgnoreMouseEvents(!0,{forward:!0});const r=0;a.once("ready-to-show",()=>{setTimeout(()=>{a&&(a.show(),a.focus())},r)}),setTimeout(()=>{a&&!a.isVisible()&&(a.show(),a.focus())},5e3),a.on("closed",()=>{a=null});try{a.setVisibleOnAllWorkspaces(!0,{visibleOnFullScreen:!0})}catch{}if(!d.isPackaged||process.env.NODE_ENV==="development")a.loadURL("http://localhost:5173");else{const o=u.join(__dirname,"../renderer/main_window/index.html");a.loadFile(o)}},C=()=>{if(g){g.focus();return}if(g=new M({width:500,height:600,title:"Island Settings",autoHideMenuBar:!0,icon:P(),webPreferences:{preload:u.join(__dirname,"preload.js"),nodeIntegration:!1,contextIsolation:!0}}),!d.isPackaged||process.env.NODE_ENV==="development")g.loadURL("http://localhost:5173/settings.html");else{const e=u.join(__dirname,"../renderer/main_window/settings.html");g.loadFile(e)}g.on("closed",()=>{g=null})};d.whenReady().then(()=>{if(!d.requestSingleInstanceLock()){F.showErrorBox("Island is already running","Another instance of Island is already running. Please close it first."),d.quit();return}E(),d.isPackaged&&(m.autoDownload=!0,m.autoInstallOnAppQuit=!0,m.setFeedURL({provider:"github",owner:"Ali120B",repo:"Island"}),m.checkForUpdatesAndNotify(),setInterval(()=>{m.checkForUpdatesAndNotify()},60*60*1e3),m.on("update-available",e=>{console.log("[Updater] Update available:",e.version),g&&g.webContents.send("update-available",e.version),a&&a.webContents.send("update-available",e.version)}),m.on("update-downloaded",e=>{console.log("[Updater] Update downloaded:",e.version),W=e,g&&g.webContents.send("update-downloaded",e.version),a&&a.webContents.send("update-downloaded",e.version)}),m.on("error",e=>{console.error("[Updater] Error:",e)})),d.on("activate",()=>{M.getAllWindows().length===0&&E()});try{const e=P();let t;e&&i.existsSync(e)?t=S.createFromPath(e).resize({width:16,height:16}):t=S.createEmpty();const n=_.buildFromTemplate([{label:"Show/Hide Island",click:()=>{a&&(a.isVisible()?a.hide():a.show())}},{label:"Settings",click:()=>{C()}},{type:"separator"},{label:"Quit",click:()=>{d.quit()}}]);O=new R(t),O.setToolTip("Island"),O.setContextMenu(n)}catch(e){console.error("Failed to create tray:",e)}});c.on("open-settings",()=>{C()});c.on("quit-and-install",()=>{m.quitAndInstall(!1,!0)});c.on("hide-island",()=>{try{a&&a.hide()}catch(e){console.error("[Main] Failed to hide island:",e)}});c.on("quit-app",()=>{try{d.quit()}catch(e){console.error("[Main] Failed to quit app:",e)}});c.handle("save-settings",async(e,t)=>{try{const n=u.join(d.getPath("documents"),"Island");i.existsSync(n)||i.mkdirSync(n,{recursive:!0});const r=u.join(n,"settings.json");return i.writeFileSync(r,JSON.stringify(t,null,2)),!0}catch(n){return console.error("Error saving settings:",n),!1}});c.handle("get-settings",async()=>{try{const e=u.join(d.getPath("documents"),"Island","settings.json");if(i.existsSync(e)){const t=i.readFileSync(e,"utf8");return JSON.parse(t)}}catch(e){console.error("Error getting settings:",e)}return{}});c.handle("change-volume",(e,t)=>($(`powershell -NoProfile -Command "${`(New-Object -ComObject WScript.Shell).SendKeys(${t==="up"?"[char]175":"[char]174"})`}"`),null));c.handle("change-brightness",(e,t)=>new Promise(n=>{const o=`
$ErrorActionPreference = 'Stop'
$brightness = (Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightness).CurrentBrightness
$newBrightness = $brightness + ${t==="up"?10:-10}
if ($newBrightness -gt 100) { $newBrightness = 100 }
if ($newBrightness -lt 0) { $newBrightness = 0 }
(Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightnessMethods).WmiSetBrightness(1, $newBrightness) | Out-Null
Write-Output $newBrightness
`,s=u.join(d.getPath("userData"),"brightness-script.ps1");try{i.writeFileSync(s,o)}catch(l){return console.error("[Main] Failed to write brightness script:",l),n(null)}$(`powershell -NoProfile -ExecutionPolicy Bypass -File "${s}"`,{timeout:6e3},(l,w,p)=>{try{i.unlinkSync(s)}catch{}if(l)return console.error("[Main] change-brightness failed:",l.message),p&&console.error("[Main] change-brightness stderr:",p),n(null);const b=Number(String(w).trim());n(Number.isFinite(b)?b:null)})}));c.handle("select-file",async()=>{const e=await F.showOpenDialog({properties:["openFile"],filters:[{name:"Applications",extensions:["exe","lnk"]}]});return e.canceled?null:e.filePaths[0]});c.handle("open-app",async(e,t)=>{await T.openPath(t)});const B=async e=>{try{if(!e||!e.toLowerCase().endsWith(".lnk"))return e;try{const t=T.readShortcutLink(e);if(t&&t.target)return console.log(`[Main] Electron resolved shortcut: ${e} -> ${t.target}`),t.target}catch{console.log("[Main] shell.readShortcutLink failed, falling back to PowerShell")}return new Promise(t=>{const n=`
$ErrorActionPreference = 'SilentlyContinue'
$path = '${e.replace(/'/g,"''")}'
try {
    $sh = New-Object -ComObject WScript.Shell
    $shortcut = $sh.CreateShortcut($path)
    if ($shortcut.TargetPath) {
        Write-Output $shortcut.TargetPath
    } else {
        Write-Output $path
    }
} catch {
    Write-Output $path
}
`,r=u.join(d.getPath("userData"),`resolve-${Date.now()}-${Math.floor(Math.random()*1e3)}.ps1`);try{i.writeFileSync(r,n)}catch{return t(e)}$(`powershell -NoProfile -ExecutionPolicy Bypass -File "${r}"`,{timeout:2e3},(o,s,l)=>{try{i.unlinkSync(r)}catch{}o||!s||!s.trim()?t(e):t(s.trim())})})}catch(t){return console.error("[Main] Error resolving shortcut:",t),e}},x=async e=>new Promise(t=>{const n=`
$ErrorActionPreference = 'Stop'
try {
    Add-Type -AssemblyName System.Drawing
    $icon = [System.Drawing.Icon]::ExtractAssociatedIcon('${e.replace(/'/g,"''")}')
    if ($icon) {
        $bitmap = $icon.ToBitmap()
        $stream = New-Object System.IO.MemoryStream
        $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
        $bytes = $stream.ToArray()
        $base64 = [Convert]::ToBase64String($bytes)
        Write-Output "data:image/png;base64,$base64"
    } else {
        Write-Output "null"
    }
} catch {
    Write-Output "null"
}
`,r=u.join(d.getPath("userData"),`icon-${Date.now()}-${Math.floor(Math.random()*1e3)}.ps1`);try{i.writeFileSync(r,n)}catch{return t(null)}$(`powershell -NoProfile -ExecutionPolicy Bypass -File "${r}"`,{timeout:3e3},(o,s,l)=>{try{i.unlinkSync(r)}catch{}o||!s||s.trim()==="null"?t(null):t(s.trim())})});c.handle("get-app-icon",async(e,t)=>{try{let n=t,r=t;if(t.toLowerCase().endsWith(".lnk"))try{const s=T.readShortcutLink(t);s&&(s.icon?(console.log(`[Main] Using shortcut icon: ${s.icon}`),n=s.icon):s.target&&(console.log(`[Main] Using shortcut target: ${s.target}`),n=s.target,r=s.target))}catch(s){console.error("[Main] Failed to read shortcut details:",s);const l=await B(t);l&&l!==t&&(n=l,r=l)}console.log(`[Main] Getting icon for: ${t} -> Target: ${n}`);const o=await d.getFileIcon(n,{size:"large"});return o.isEmpty()?(console.log("[Main] Falling back to PowerShell for icon:",r),await x(r)):o.toDataURL()}catch(n){return console.error("Error getting icon:",n),await x(t)}});c.handle("save-todo",async(e,t)=>{try{const n=u.join(d.getPath("documents"),"Island");i.existsSync(n)||i.mkdirSync(n,{recursive:!0});const r=u.join(n,"todo.json");return i.writeFileSync(r,JSON.stringify(t,null,2)),!0}catch(n){return console.error("Error saving todo:",n),!1}});c.handle("get-todo",async()=>{try{const e=u.join(d.getPath("documents"),"Island","todo.json");if(i.existsSync(e)){const t=i.readFileSync(e,"utf8");return JSON.parse(t)}}catch(e){console.error("Error getting todo:",e)}return[]});c.handle("get-calendar-events",async()=>{try{const e=u.join(d.getPath("documents"),"Island","calendar-events.json");if(i.existsSync(e)){const t=i.readFileSync(e,"utf8");return JSON.parse(t)}}catch(e){console.error("Error getting calendar events:",e)}return{}});c.handle("save-calendar-events",async(e,t)=>{try{const n=u.join(d.getPath("documents"),"Island");i.existsSync(n)||i.mkdirSync(n,{recursive:!0});const r=u.join(n,"calendar-events.json");return i.writeFileSync(r,JSON.stringify(t,null,2)),!0}catch(n){return console.error("Error saving calendar events:",n),!1}});c.handle("log",(e,t)=>{console.log(`[Renderer]: ${t}`)});c.handle("get-system-media",async()=>new Promise(e=>{const t=`
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
`,n=u.join(d.getPath("userData"),"media-script.ps1");try{i.writeFileSync(n,t)}catch(s){return console.error("[Media] Failed to write script:",s),e(null)}const r=s=>{$("pwsh -Version",{timeout:2e3},l=>{s(!l)})},o=s=>{const l=s?"pwsh":"powershell";console.log(`[Media] Using ${l}...`),$(`${l} -NoProfile -ExecutionPolicy Bypass -File "${n}"`,{timeout:8e3},(w,p,b)=>{try{i.unlinkSync(n)}catch{}if(b&&console.log("[Media] Stderr:",b),p&&console.log("[Media] Output:",p.trim().substring(0,150)),w)return console.error("[Media] Error:",w.message),e(null);try{const I=p.trim().split(`
`).find(N=>N.trim().startsWith("{"));if(!I||I==="null")return console.log("[Media] No session found"),e(null);const f=JSON.parse(I);console.log("[Media] Found:",f.Title,"-",f.Artist);let v=f.Source||"System";v.includes(".")&&(v=v.split(".")[0]),e({name:f.Title||"Unknown Title",artist:f.Artist||"Unknown Artist",album:f.Album||"",state:f.Status==="playing"?"playing":"paused",source:v,artwork_url:null})}catch(A){console.error("[Media] Parse error:",A.message),e(null)}})};r(s=>o(s))}));d.on("window-all-closed",()=>{d.quit()});c.handle("write-files-to-clipboard",(e,t)=>{if(!t||!Array.isArray(t))return;const n=t.filter(o=>typeof o=="string"&&o.length>0);if(n.length===0){console.log("[Main]: No valid paths to write.");return}const r=n.map(o=>u.win32.normalize(o));console.log("[Main]: WRITING TO CLIPBOARD (filenames only):",r);try{y.clear(),y.write({filenames:r})}catch(o){console.error("[Main]: Clipboard error:",o)}});c.on("ondragstart",(e,t)=>{if(console.log(`[Main] Attempting dragstart for: ${t}`),i.existsSync(t)){const n=P();let r;n&&i.existsSync(n)&&(r=S.createFromPath(n),r.isEmpty()?r=void 0:r=r.resize({width:32,height:32}));const o=u.resolve(t);console.log(`[Main] Starting OS drag for REAL file: ${o}`);try{if(!i.existsSync(o))throw new Error(`File not found: ${o}`);d.getFileIcon(o,{size:"normal"}).then(s=>{const l=M.fromWebContents(e.sender);l&&(l.setIgnoreMouseEvents(!0,{forward:!1}),l.setAlwaysOnTop(!0,"floating")),e.sender.startDrag({file:o,icon:s}),console.log(`[Main] OS acknowledged REAL file drag for: ${o}`),e.sender.once("drag-end",()=>{console.log(`[Main] Drag ended for: ${o}`),l&&!l.isDestroyed()&&(l.setAlwaysOnTop(!0,"screen-saver"),l.setIgnoreMouseEvents(!1)),e.sender.send("drag-finished",t)})}).catch(s=>{console.error("[Main] Error getting file icon:",s);const l=P(),w=l&&i.existsSync(l)?S.createFromPath(l).resize({width:32,height:32}):S.createEmpty(),p=M.fromWebContents(e.sender);p&&(p.setIgnoreMouseEvents(!0,{forward:!1}),p.setAlwaysOnTop(!0,"floating")),e.sender.startDrag({file:o,files:[o],icon:w}),p&&!p.isDestroyed()&&(p.setAlwaysOnTop(!0,"screen-saver"),p.setIgnoreMouseEvents(!1)),e.sender.send("drag-finished",t)})}catch(s){console.error("[Main] Critical error during startDrag:",s)}}else console.error(`[Main] File does not exist for drag: ${t}`)});const k=()=>{const e=u.join(d.getPath("documents"),"Island","ai_chats");return i.existsSync(e)||i.mkdirSync(e,{recursive:!0}),u.join(e,"history.json")};c.handle("save-chat-history",async(e,t)=>{try{const n=k();let r=[];if(i.existsSync(n))try{const s=i.readFileSync(n,"utf8");r=JSON.parse(s)}catch(s){console.error("Error reading chat history:",s)}const o=r.findIndex(s=>s.id===t.id);return o>=0?r[o]={...r[o],...t,timestamp:Date.now()}:r.push({...t,timestamp:Date.now()}),i.writeFileSync(n,JSON.stringify(r,null,2)),!0}catch(n){return console.error("Error saving chat history:",n),!1}});c.handle("get-chat-history",async()=>{try{const e=k();if(i.existsSync(e)){const t=i.readFileSync(e,"utf8");return JSON.parse(t)}return[]}catch(e){return console.error("Error getting chat history:",e),[]}});c.handle("delete-chat-history-item",async(e,t)=>{try{const n=k();if(i.existsSync(n)){const r=i.readFileSync(n,"utf8");let o=JSON.parse(r);return o=o.filter(s=>s.id!==t),i.writeFileSync(n,JSON.stringify(o,null,2)),!0}return!1}catch(n){return console.error("Error deleting chat history item:",n),!1}});c.handle("clear-chat-history",async()=>{try{const e=k();return i.existsSync(e)&&i.unlinkSync(e),!0}catch(e){return console.error("Error clearing chat history:",e),!1}});let h=[];const U=50,j=()=>{const e=y.readText(),t=y.readImage();let n=null;if(t.isEmpty())e&&e.trim()&&(h.length===0||h[0].content!==e)&&(n={type:"text",content:e,timestamp:Date.now()});else{const r=t.toDataURL();(h.length===0||h[0].content!==r)&&(n={type:"image",content:r,timestamp:Date.now()})}n&&(h.unshift(n),h.length>U&&h.pop(),a&&a.webContents.send("clipboard-update",h))};setInterval(j,1e3);c.handle("get-clipboard-history",()=>h);c.handle("copy-to-clipboard",(e,{type:t,content:n})=>{if(t==="image"){const r=S.createFromDataURL(n);y.writeImage(r)}else y.writeText(n);return j(),!0});c.handle("clear-clipboard-history",()=>(h=[],y.clear(),a&&a.webContents.send("clipboard-update",h),!0));c.handle("delete-clipboard-item",(e,t)=>{const n=h.find(r=>r.timestamp===t);if(n){const r=y.readText(),o=y.readImage();let s=!1;(n.type==="text"&&n.content===r||n.type==="image"&&!o.isEmpty()&&n.content===o.toDataURL())&&(s=!0),s&&y.clear()}return h=h.filter(r=>r.timestamp!==t),a&&a.webContents.send("clipboard-update",h),!0});
