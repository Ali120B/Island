"use strict";const{app:p,BrowserWindow:C,screen:K,ipcMain:c,shell:L,Tray:Q,Menu:Y,nativeImage:k,clipboard:P,dialog:X}=require("electron"),{autoUpdater:S}=require("electron-updater"),u=require("node:path"),r=require("fs"),ee=require("node:http"),{exec:D}=require("child_process");p.commandLine.appendSwitch("autoplay-policy","no-user-gesture-required");let W=null,a=null,M=null,q=null;const U=()=>{const e=u.join(p.getPath("documents"),"Island");return r.existsSync(e)||r.mkdirSync(e,{recursive:!0}),e},j=()=>u.join(U(),"settings.json"),V=()=>u.join(U(),"calendar-events.json"),G=()=>u.join(U(),"google-calendar-token.json"),F=()=>{try{const e=j();return r.existsSync(e)?JSON.parse(r.readFileSync(e,"utf8")):{}}catch(e){return console.error("[Main] Failed to read settings:",e),{}}},J=()=>{try{const e=V();return r.existsSync(e)?JSON.parse(r.readFileSync(e,"utf8")):{}}catch(e){return console.error("[Main] Failed to read calendar events:",e),{}}},z=e=>{try{return r.writeFileSync(V(),JSON.stringify(e,null,2)),!0}catch(t){return console.error("[Main] Failed to write calendar events:",t),!1}};c.handle("get-update-status",()=>q);c.handle("set-ignore-mouse-events",(e,t,n)=>{a&&a.setIgnoreMouseEvents(t,{forward:n||!1})});c.handle("open-external",async(e,t)=>{await L.openExternal(t)});c.handle("google-calendar-connect",async()=>{try{const e=F(),t=e["google-calendar-client-id"],n=e["google-calendar-client-secret"];if(!t||!n)return{success:!1,error:"Missing Google OAuth Client ID/Secret. Add them in Settings first."};const o=await new Promise((I,E)=>{const b=ee.createServer((v,h)=>{try{const y=new URL(v.url,"http://127.0.0.1"),$=y.searchParams.get("code"),_=y.searchParams.get("error");if(_){h.writeHead(200,{"Content-Type":"text/html"}),h.end("<h3>Google Calendar connection failed. You can close this tab.</h3>"),b.close(),E(new Error(_));return}if($){h.writeHead(200,{"Content-Type":"text/html"}),h.end("<h3>Google Calendar connected. You can close this tab.</h3>"),b.close(),I($);return}h.writeHead(400,{"Content-Type":"text/html"}),h.end("<h3>Invalid callback request.</h3>")}catch(y){E(y)}});b.listen(0,"127.0.0.1",async()=>{const{port:v}=b.address(),h=`http://127.0.0.1:${v}`,y=new URL("https://accounts.google.com/o/oauth2/v2/auth");y.searchParams.set("client_id",t),y.searchParams.set("redirect_uri",h),y.searchParams.set("response_type","code"),y.searchParams.set("scope","https://www.googleapis.com/auth/calendar.readonly"),y.searchParams.set("access_type","offline"),y.searchParams.set("prompt","consent"),e["google-calendar-redirect-uri"]=h,r.writeFileSync(j(),JSON.stringify(e,null,2)),await L.openExternal(y.toString())}),setTimeout(()=>{try{b.close()}catch{}E(new Error("Timed out waiting for Google authorization."))},18e4)}),i=F()["google-calendar-redirect-uri"],l=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({code:o,client_id:t,client_secret:n,redirect_uri:i,grant_type:"authorization_code"})}),f=await l.json();if(!l.ok)return{success:!1,error:(f==null?void 0:f.error_description)||(f==null?void 0:f.error)||"Failed to exchange auth code."};const d=Date.now()+(f.expires_in||3600)*1e3;return r.writeFileSync(G(),JSON.stringify({...f,expires_at:d},null,2)),{success:!0}}catch(e){return console.error("[Main] Google calendar connect failed:",e),{success:!1,error:e.message||"Google Calendar connection failed."}}});c.handle("google-calendar-disconnect",async()=>{try{const e=G();return r.existsSync(e)&&r.unlinkSync(e),{success:!0}}catch(e){return console.error("[Main] Google calendar disconnect failed:",e),{success:!1,error:e.message||"Failed to disconnect Google Calendar."}}});c.handle("google-calendar-status",async()=>({connected:r.existsSync(G())}));c.handle("google-calendar-sync",async()=>{var e,t,n;try{const o=F(),s=o["google-calendar-client-id"],i=o["google-calendar-client-secret"],l=o["google-calendar-redirect-uri"],f=G();if(!r.existsSync(f))return{success:!1,error:"Google Calendar is not connected."};const d=JSON.parse(r.readFileSync(f,"utf8"));let I=d.access_token;if(!I||d.expires_at&&Date.now()>d.expires_at-3e4){if(!d.refresh_token)return{success:!1,error:"Google token expired and no refresh token was found. Reconnect required."};const g=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:s,client_secret:i,refresh_token:d.refresh_token,grant_type:"refresh_token",redirect_uri:l})}),m=await g.json();if(!g.ok)return{success:!1,error:(m==null?void 0:m.error_description)||"Failed to refresh Google token."};I=m.access_token;const A={...d,...m,refresh_token:d.refresh_token,expires_at:Date.now()+(m.expires_in||3600)*1e3};r.writeFileSync(f,JSON.stringify(A,null,2))}const E=new Date().toISOString(),b=await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(E)}&maxResults=20`,{headers:{Authorization:`Bearer ${I}`}}),v=await b.json();if(!b.ok)return{success:!1,error:((e=v==null?void 0:v.error)==null?void 0:e.message)||"Failed to fetch Google Calendar events."};const h={};for(const g of v.items||[]){const m=((t=g==null?void 0:g.start)==null?void 0:t.dateTime)||"",A=((n=g==null?void 0:g.start)==null?void 0:n.date)||"",T=(m||A||"").slice(0,10);if(!T)continue;let R="";if(m){const N=new Date(m);Number.isNaN(N.getTime())||(R=`${String(N.getHours()).padStart(2,"0")}:${String(N.getMinutes()).padStart(2,"0")}:00`)}h[T]||(h[T]=[]),h[T].push({id:`google:${g.id}`,text:g.summary||"Untitled Google event",time:R,source:"google",googleEventId:g.id})}const y=J(),$={};for(const[g,m]of Object.entries(y)){const A=(Array.isArray(m)?m:[]).filter(T=>(T==null?void 0:T.source)!=="google");A.length>0&&($[g]=A)}for(const[g,m]of Object.entries(h)){const A=Array.isArray($[g])?$[g]:[];$[g]=[...A,...m]}return{success:z($),imported:Object.values(h).reduce((g,m)=>g+m.length,0)}}catch(o){return console.error("[Main] Google calendar sync failed:",o),{success:!1,error:o.message||"Google Calendar sync failed."}}});const x=()=>{try{const t="icon.png";if(p.isPackaged){const s=u.join(process.resourcesPath,t);if(r.existsSync(s))return s;const i=u.join(process.resourcesPath,"assets","icons",t);if(r.existsSync(i))return i}const n=p.getAppPath(),o=[u.join(n,"src","assets","icons",t),u.join(n,"assets","icons",t),u.join(__dirname,"assets","icons",t),u.join(__dirname,"..","src","assets","icons",t)];for(const s of o)try{if(r.existsSync(s))return s}catch(i){console.error(`[Main] Error checking path ${s}:`,i)}}catch(e){console.error("[Main] Error in getIconPath:",e)}},B=()=>{const e=K.getPrimaryDisplay(),{width:t,height:n}=e.size;a=new C({width:t,height:n,x:0,y:0,backgroundColor:"#00000000",transparent:!0,alwaysOnTop:!0,resizable:!1,frame:!1,thickFrame:!1,hasShadow:!1,skipTaskbar:!0,icon:x(),hiddenInMissionControl:!0,type:"toolbar",fullscreen:!1,visibleOnFullScreen:!0,webPreferences:{preload:u.join(__dirname,"preload.js"),devTools:!1,webviewTag:!0},show:!1}),a.setAlwaysOnTop(!0,"screen-saver"),a.setVisibleOnAllWorkspaces(!0,{visibleOnFullScreen:!0}),a.setFullScreen(!0),a.setIgnoreMouseEvents(!0,{forward:!0});const o=0;a.once("ready-to-show",()=>{setTimeout(()=>{a&&(a.show(),a.focus())},o)}),setTimeout(()=>{a&&!a.isVisible()&&(a.show(),a.focus())},5e3),a.on("closed",()=>{a=null});try{a.setVisibleOnAllWorkspaces(!0,{visibleOnFullScreen:!0})}catch{}if(!p.isPackaged||process.env.NODE_ENV==="development")a.loadURL("http://localhost:5173");else{const s=u.join(__dirname,"../renderer/main_window/index.html");a.loadFile(s)}},H=()=>{if(M){M.focus();return}if(M=new C({width:500,height:600,title:"Island Settings",autoHideMenuBar:!0,icon:x(),webPreferences:{preload:u.join(__dirname,"preload.js"),nodeIntegration:!1,contextIsolation:!0}}),!p.isPackaged||process.env.NODE_ENV==="development")M.loadURL("http://localhost:5173/settings.html");else{const e=u.join(__dirname,"../renderer/main_window/settings.html");M.loadFile(e)}M.on("closed",()=>{M=null})};p.whenReady().then(()=>{if(!p.requestSingleInstanceLock()){X.showErrorBox("Island is already running","Another instance of Island is already running. Please close it first."),p.quit();return}B(),S.logger=console,S.autoDownload=!0,S.autoInstallOnAppQuit=!0,c.handle("check-for-updates",async()=>{try{return{success:!0,result:await S.checkForUpdatesAndNotify()}}catch(e){return console.error("[Updater] Manual check failed:",e),{success:!1,error:e.message}}}),p.isPackaged&&(S.checkForUpdatesAndNotify(),setInterval(()=>{S.checkForUpdatesAndNotify()},60*60*1e3),S.on("checking-for-update",()=>{console.log("[Updater] Checking for update...")}),S.on("update-available",e=>{console.log("[Updater] Update available:",e.version);const t={version:e.version,status:"available"};M&&M.webContents.send("update-status",t),a&&a.webContents.send("update-status",t)}),S.on("update-not-available",e=>{console.log("[Updater] Update not available.")}),S.on("download-progress",e=>{let t="Download speed: "+e.bytesPerSecond;t=t+" - Downloaded "+e.percent+"%",t=t+" ("+e.transferred+"/"+e.total+")",console.log("[Updater] "+t)}),S.on("update-downloaded",e=>{console.log("[Updater] Update downloaded:",e.version),q=e;const t={version:e.version,status:"downloaded"};M&&M.webContents.send("update-status",t),a&&a.webContents.send("update-status",t)}),S.on("error",e=>{console.error("[Updater] Signal Error:",e)})),p.on("activate",()=>{C.getAllWindows().length===0&&B()});try{const e=x();let t;e&&r.existsSync(e)?t=k.createFromPath(e).resize({width:16,height:16}):t=k.createEmpty();const n=Y.buildFromTemplate([{label:"Show/Hide Island",click:()=>{a&&(a.isVisible()?a.hide():a.show())}},{label:"Settings",click:()=>{H()}},{type:"separator"},{label:"Quit",click:()=>{p.quit()}}]);W=new Q(t),W.setToolTip("Island"),W.setContextMenu(n)}catch(e){console.error("Failed to create tray:",e)}});c.on("open-settings",()=>{H()});c.on("quit-and-install",()=>{S.quitAndInstall(!1,!0)});c.on("hide-island",()=>{try{a&&a.hide()}catch(e){console.error("[Main] Failed to hide island:",e)}});c.on("quit-app",()=>{try{p.quit()}catch(e){console.error("[Main] Failed to quit app:",e)}});c.handle("save-settings",async(e,t)=>{try{return r.writeFileSync(j(),JSON.stringify(t,null,2)),!0}catch(n){return console.error("Error saving settings:",n),!1}});c.handle("get-settings",async()=>F());c.handle("change-volume",async(e,t)=>{const o=`
Add-Type @'
using System;
using System.Runtime.InteropServices;
[Guid("5CDF2C82-841E-4546-972F-1C692B79FE38"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IAudioEndpointVolume {
    int f1(); int f2(); int f3(); int f4();
    int SetMasterVolumeLevelScalar(float fLevel, Guid pguidEventContext);
    int GetMasterVolumeLevelScalar(out float pfLevel);
    int f7(); int f8(); int f9(); int f10();
}
[Guid("D666063F-1587-4E43-81F1-B948E807363F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IMMDevice {
    int Activate(ref Guid iid, int dwClsCtx, IntPtr pActivationParams, [MarshalAs(UnmanagedType.IUnknown)] out object ppInterface);
}
[Guid("A95664D2-9614-4F35-A746-DE8DB63617E6"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IMMDeviceEnumerator {
    int f1();
    int GetDefaultAudioEndpoint(int dataFlow, int role, out IMMDevice ppDevice);
}
[ComImport, Guid("BCDE0395-E52F-467C-8E3D-C4579291692E")] class MMDeviceEnumerator { }
public class Audio {
    public static float Get() {
        try {
            var enumerator = new MMDeviceEnumerator() as IMMDeviceEnumerator;
            IMMDevice device; enumerator.GetDefaultAudioEndpoint(0, 1, out device);
            Guid iid = typeof(IAudioEndpointVolume).GUID;
            object o; device.Activate(ref iid, 0, IntPtr.Zero, out o);
            var endpoint = o as IAudioEndpointVolume; float volume;
            endpoint.GetMasterVolumeLevelScalar(out volume);
            return volume;
        } catch { return -1; }
    }
    public static void Set(float level) {
        try {
            var enumerator = new MMDeviceEnumerator() as IMMDeviceEnumerator;
            IMMDevice device; enumerator.GetDefaultAudioEndpoint(0, 1, out device);
            Guid iid = typeof(IAudioEndpointVolume).GUID;
            object o; device.Activate(ref iid, 0, IntPtr.Zero, out o);
            var endpoint = o as IAudioEndpointVolume;
            endpoint.SetMasterVolumeLevelScalar(level, Guid.Empty);
        } catch { }
    }
}
'@
try {
  $c = [Audio]::Get()
  if ($c -lt 0) { Write-Output 50; exit }
  $n = $c + ${t==="up"?.02:-.02}
  if ($n -gt 1) { $n = 1 }
  if ($n -lt 0) { $n = 0 }
  [Audio]::Set($n)
  Write-Output ([Math]::Round($n * 100))
} catch { Write-Output 50 }`,s=u.join(p.getPath("userData"),`vol-${Date.now()}-${Math.random().toString(36).slice(2)}.ps1`);try{r.writeFileSync(s,o,{encoding:"utf8"})}catch(i){return console.error("[Main] Failed to write vol script:",i),null}return new Promise(i=>{D(`powershell -NoProfile -ExecutionPolicy Bypass -File "${s}"`,{timeout:6e3},(l,f,d)=>{try{r.existsSync(s)&&r.unlinkSync(s)}catch{}if(l)console.error("[Main] Volume PS Error:",l,d),i(null);else{const I=Number(String(f).trim());i(Number.isFinite(I)?I:null)}})})});c.handle("get-volume",async()=>{const e=`
Add-Type @'
using System;
using System.Runtime.InteropServices;
[Guid("5CDF2C82-841E-4546-972F-1C692B79FE38"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IAudioEndpointVolume {
    int f1(); int f2(); int f3(); int f4();
    int SetMasterVolumeLevelScalar(float fLevel, Guid pguidEventContext);
    int GetMasterVolumeLevelScalar(out float pfLevel);
    int f7(); int f8(); int f9(); int f10();
}
[Guid("D666063F-1587-4E43-81F1-B948E807363F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IMMDevice {
    int Activate(ref Guid iid, int dwClsCtx, IntPtr pActivationParams, [MarshalAs(UnmanagedType.IUnknown)] out object ppInterface);
}
[Guid("A95664D2-9614-4F35-A746-DE8DB63617E6"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IMMDeviceEnumerator {
    int f1();
    int GetDefaultAudioEndpoint(int dataFlow, int role, out IMMDevice ppDevice);
}
[ComImport, Guid("BCDE0395-E52F-467C-8E3D-C4579291692E")] class MMDeviceEnumerator { }
public class Audio {
    public static float Get() {
        try {
            var enumerator = new MMDeviceEnumerator() as IMMDeviceEnumerator;
            IMMDevice device; enumerator.GetDefaultAudioEndpoint(0, 1, out device);
            Guid iid = typeof(IAudioEndpointVolume).GUID;
            object o; device.Activate(ref iid, 0, IntPtr.Zero, out o);
            var endpoint = o as IAudioEndpointVolume; float volume;
            endpoint.GetMasterVolumeLevelScalar(out volume);
            return volume;
        } catch { return -1; }
    }
}
'@
$c = [Audio]::Get()
if ($c -lt 0) { Write-Output 50 } else { Write-Output ([Math]::Round($c * 100)) }`,t=u.join(p.getPath("userData"),`getvol-${Date.now()}.ps1`);try{return r.writeFileSync(t,e,{encoding:"utf8"}),new Promise(n=>{D(`powershell -NoProfile -ExecutionPolicy Bypass -File "${t}"`,{timeout:5e3},(o,s)=>{try{r.existsSync(t)&&r.unlinkSync(t)}catch{}if(o)n(50);else{const i=Number(String(s).trim());n(Number.isFinite(i)?i:50)}})})}catch{return 50}});c.handle("change-brightness",(e,t)=>new Promise(n=>{const s=`
try {
  $ErrorActionPreference = 'Stop'
  $monitors = Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightness
  $brightness = $monitors[0].CurrentBrightness
  $newBrightness = $brightness + ${t==="up"?10:-10}
  if ($newBrightness -gt 100) { $newBrightness = 100 }
  if ($newBrightness -lt 0) { $newBrightness = 0 }
  $methods = Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightnessMethods
  $methods[0].WmiSetBrightness(1, $newBrightness)
  Write-Output $newBrightness
} catch {
  Write-Output 50
}
`,i=u.join(p.getPath("userData"),`brightness-${Date.now()}.ps1`);try{r.writeFileSync(i,s,{encoding:"utf8"}),D(`powershell -NoProfile -ExecutionPolicy Bypass -File "${i}"`,{timeout:6e3},(l,f)=>{try{r.existsSync(i)&&r.unlinkSync(i)}catch{}if(l)n(null);else{const d=Number(String(f).trim());n(Number.isFinite(d)?d:null)}})}catch{n(null)}}));c.handle("get-brightness",async()=>{const e=`
try {
  $monitors = Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightness
  Write-Output $monitors[0].CurrentBrightness
} catch {
  Write-Output 50
}
`,t=u.join(p.getPath("userData"),`getbrightness-${Date.now()}.ps1`);try{return r.writeFileSync(t,e,{encoding:"utf8"}),new Promise(n=>{D(`powershell -NoProfile -ExecutionPolicy Bypass -File "${t}"`,{timeout:5e3},(o,s)=>{try{r.existsSync(t)&&r.unlinkSync(t)}catch{}if(o)n(50);else{const i=Number(String(s).trim());n(Number.isFinite(i)?i:50)}})})}catch{return 50}});c.handle("save-todo",async(e,t)=>{try{const n=u.join(p.getPath("documents"),"Island");r.existsSync(n)||r.mkdirSync(n,{recursive:!0});const o=u.join(n,"todo.json");return r.writeFileSync(o,JSON.stringify(t,null,2)),!0}catch(n){return console.error("Error saving todo:",n),!1}});c.handle("get-todo",async()=>{try{const e=u.join(p.getPath("documents"),"Island","todo.json");if(r.existsSync(e)){const t=r.readFileSync(e,"utf8");return JSON.parse(t)}}catch(e){console.error("Error getting todo:",e)}return[]});c.handle("get-calendar-events",async()=>J());c.handle("save-calendar-events",async(e,t)=>z(t));c.handle("log",(e,t)=>{console.log(`[Renderer]: ${t}`)});c.handle("get-system-media",async()=>new Promise(e=>{const t=`
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
`,n=u.join(p.getPath("userData"),"media-script.ps1");try{r.writeFileSync(n,t)}catch(i){return console.error("[Media] Failed to write script:",i),e(null)}const o=i=>{D("pwsh -Version",{timeout:2e3},l=>{i(!l)})},s=i=>{const l=i?"pwsh":"powershell";console.log(`[Media] Using ${l}...`),D(`${l} -NoProfile -ExecutionPolicy Bypass -File "${n}"`,{timeout:8e3},(f,d,I)=>{try{r.unlinkSync(n)}catch{}if(I&&console.log("[Media] Stderr:",I),d&&console.log("[Media] Output:",d.trim().substring(0,150)),f)return console.error("[Media] Error:",f.message),e(null);try{const v=d.trim().split(`
`).find($=>$.trim().startsWith("{"));if(!v||v==="null")return console.log("[Media] No session found"),e(null);const h=JSON.parse(v);console.log("[Media] Found:",h.Title,"-",h.Artist);let y=h.Source||"System";y.includes(".")&&(y=y.split(".")[0]),e({name:h.Title||"Unknown Title",artist:h.Artist||"Unknown Artist",album:h.Album||"",state:h.Status==="playing"?"playing":"paused",source:y,artwork_url:null})}catch(E){console.error("[Media] Parse error:",E.message),e(null)}})};o(i=>s(i))}));p.on("window-all-closed",()=>{p.quit()});c.handle("write-files-to-clipboard",(e,t)=>{if(!t||!Array.isArray(t))return;const n=t.filter(s=>typeof s=="string"&&s.length>0);if(n.length===0){console.log("[Main]: No valid paths to write.");return}const o=n.map(s=>u.win32.normalize(s));console.log("[Main]: WRITING TO CLIPBOARD (filenames only):",o);try{P.clear(),P.write({filenames:o})}catch(s){console.error("[Main]: Clipboard error:",s)}});c.on("ondragstart",(e,t)=>{if(console.log(`[Main] Attempting dragstart for: ${t}`),r.existsSync(t)){const n=x();let o;n&&r.existsSync(n)&&(o=k.createFromPath(n),o.isEmpty()?o=void 0:o=o.resize({width:32,height:32}));const s=u.resolve(t);console.log(`[Main] Starting OS drag for REAL file: ${s}`);try{if(!r.existsSync(s))throw new Error(`File not found: ${s}`);p.getFileIcon(s,{size:"normal"}).then(i=>{const l=C.fromWebContents(e.sender);l&&(l.setIgnoreMouseEvents(!0,{forward:!1}),l.setAlwaysOnTop(!0,"floating")),e.sender.startDrag({file:s,icon:i}),console.log(`[Main] OS acknowledged REAL file drag for: ${s}`),e.sender.once("drag-end",()=>{console.log(`[Main] Drag ended for: ${s}`),l&&!l.isDestroyed()&&(l.setAlwaysOnTop(!0,"screen-saver"),l.setIgnoreMouseEvents(!1)),e.sender.send("drag-finished",t)})}).catch(i=>{console.error("[Main] Error getting file icon:",i);const l=x(),f=l&&r.existsSync(l)?k.createFromPath(l).resize({width:32,height:32}):k.createEmpty(),d=C.fromWebContents(e.sender);d&&(d.setIgnoreMouseEvents(!0,{forward:!1}),d.setAlwaysOnTop(!0,"floating")),e.sender.startDrag({file:s,files:[s],icon:f}),d&&!d.isDestroyed()&&(d.setAlwaysOnTop(!0,"screen-saver"),d.setIgnoreMouseEvents(!1)),e.sender.send("drag-finished",t)})}catch(i){console.error("[Main] Critical error during startDrag:",i)}}else console.error(`[Main] File does not exist for drag: ${t}`)});const O=()=>{const e=u.join(p.getPath("documents"),"Island","ai_chats");return r.existsSync(e)||r.mkdirSync(e,{recursive:!0}),u.join(e,"history.json")};c.handle("save-chat-history",async(e,t)=>{try{const n=O();let o=[];if(r.existsSync(n))try{const i=r.readFileSync(n,"utf8");o=JSON.parse(i)}catch(i){console.error("Error reading chat history:",i)}const s=o.findIndex(i=>i.id===t.id);return s>=0?o[s]={...o[s],...t,timestamp:Date.now()}:o.push({...t,timestamp:Date.now()}),r.writeFileSync(n,JSON.stringify(o,null,2)),!0}catch(n){return console.error("Error saving chat history:",n),!1}});c.handle("get-chat-history",async()=>{try{const e=O();if(r.existsSync(e)){const t=r.readFileSync(e,"utf8");return JSON.parse(t)}return[]}catch(e){return console.error("Error getting chat history:",e),[]}});c.handle("delete-chat-history-item",async(e,t)=>{try{const n=O();if(r.existsSync(n)){const o=r.readFileSync(n,"utf8");let s=JSON.parse(o);return s=s.filter(i=>i.id!==t),r.writeFileSync(n,JSON.stringify(s,null,2)),!0}return!1}catch(n){return console.error("Error deleting chat history item:",n),!1}});c.handle("clear-chat-history",async()=>{try{const e=O();return r.existsSync(e)&&r.unlinkSync(e),!0}catch(e){return console.error("Error clearing chat history:",e),!1}});let w=[];const te=50,Z=()=>{const e=P.readText(),t=P.readImage();let n=null;if(t.isEmpty())e&&e.trim()&&(w.length===0||w[0].content!==e)&&(n={type:"text",content:e,timestamp:Date.now()});else{const o=t.toDataURL();(w.length===0||w[0].content!==o)&&(n={type:"image",content:o,timestamp:Date.now()})}n&&(w.unshift(n),w.length>te&&w.pop(),a&&a.webContents.send("clipboard-update",w))};setInterval(Z,1e3);c.handle("get-clipboard-history",()=>w);c.handle("copy-to-clipboard",(e,{type:t,content:n})=>{if(t==="image"){const o=k.createFromDataURL(n);P.writeImage(o)}else P.writeText(n);return Z(),!0});c.handle("clear-clipboard-history",()=>(w=[],P.clear(),a&&a.webContents.send("clipboard-update",w),!0));c.handle("delete-clipboard-item",(e,t)=>{const n=w.find(o=>o.timestamp===t);if(n){const o=P.readText(),s=P.readImage();let i=!1;(n.type==="text"&&n.content===o||n.type==="image"&&!s.isEmpty()&&n.content===s.toDataURL())&&(i=!0),i&&P.clear()}return w=w.filter(o=>o.timestamp!==t),a&&a.webContents.send("clipboard-update",w),!0});
