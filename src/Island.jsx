import { useState, useEffect, useRef, Component } from 'react';
import { Home, Music, MessageSquare, Cloud, Battery, BatteryLow, BatteryMedium, BatteryFull, Zap, ChevronLeft, ChevronRight, Sun, Moon, Box, Search, History, Trash2, X, Clipboard as ClipboardIcon, Volume2, VolumeX, Wind, Droplets, Thermometer, ChevronDown, ChevronUp, Play, Pause, RotateCcw, Timer as TimerIcon, Pin, CloudRain, Plus, List, Edit2, Settings, Check, GripVertical, Calendar, LayoutGrid, Folder } from 'lucide-react';
import { OpenAI } from "openai";
import "./App.css";
import lowBatteryIcon from "./assets/images/lowbattery.png";
import chargingIcon from "./assets/images/charging.png";
import remainderSoundLocal from "./assets/audio/remainder.mp3";

//Get Date
function formatDateShort(input) {
  const date = input ? new Date(input) : new Date();
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date provided to formatDateShort");
  }
  const weekday = date.toLocaleDateString(undefined, { weekday: "short" });
  const month = date.toLocaleDateString(undefined, { month: "short" });
  const day = date.getDate();
  return `${weekday}, ${month} ${day}`;
}

function openApp(app) {
  if (!app) return;
  try {
    window.location.href = `${app}://`;
  } catch (e) {
    window.alert("Failed to open app:", app, e);
  }
}

const AnalogClock = ({ size = 150, color = "#fff", style = "simple" }) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const secs = now.getSeconds();
  const mins = now.getMinutes();
  const hrs = now.getHours() % 12;

  const secDeg = (secs / 60) * 360;
  const minDeg = ((mins + secs / 60) / 60) * 360;
  const hrDeg = ((hrs + mins / 60) / 12) * 360;

  const renderSimple = () => (
    <>
      <circle cx="50" cy="50" r="48" stroke={color} strokeWidth="2" fill="none" opacity="0.2" />
      {[...Array(12)].map((_, i) => (
        <line
          key={i}
          x1="50" y1="5" x2="50" y2="10"
          transform={`rotate(${i * 30} 50 50)`}
          stroke={color} strokeWidth="2" opacity="0.5"
        />
      ))}
      <line x1="50" y1="50" x2="50" y2="25" transform={`rotate(${hrDeg} 50 50)`} stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="50" x2="50" y2="15" transform={`rotate(${minDeg} 50 50)`} stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="50" x2="50" y2="10" transform={`rotate(${secDeg} 50 50)`} stroke="#ef4444" strokeWidth="1" strokeLinecap="round" />
      <circle cx="50" cy="50" r="2" fill={color} />
    </>
  );

  const renderCyber = () => (
    <>
      <circle cx="50" cy="50" r="48" stroke={color} strokeWidth="1" fill="none" opacity="0.1" strokeDasharray="2 2" />
      <circle cx="50" cy="50" r="42" stroke={color} strokeWidth="0.5" fill="none" opacity="0.05" />
      {[...Array(60)].map((_, i) => (
        <line
          key={i}
          x1="50" y1="2" x2="50" y2={i % 5 === 0 ? 8 : 4}
          transform={`rotate(${i * 6} 50 50)`}
          stroke={color} strokeWidth={i % 5 === 0 ? 1 : 0.5}
          opacity={i % 5 === 0 ? 0.8 : 0.2}
        />
      ))}
      {/* Neon Glow Hands */}
      <line x1="50" y1="50" x2="50" y2="28" transform={`rotate(${hrDeg} 50 50)`} stroke={color} strokeWidth="4" strokeLinecap="butt" />
      <line x1="50" y1="50" x2="50" y2="18" transform={`rotate(${minDeg} 50 50)`} stroke={color} strokeWidth="2.5" strokeLinecap="butt" />
      <line x1="50" y1="50" x2="50" y2="8" transform={`rotate(${secDeg} 50 50)`} stroke="#00f2ff" strokeWidth="1" />
      <rect x="47" y="47" width="6" height="6" fill={color} transform={`rotate(${secDeg} 50 50)`} />
    </>
  );

  const renderMinimalist = () => (
    <>
      <circle cx="50" cy="50" r="2" fill={color} opacity="0.5" />
      <line x1="50" y1="50" x2="50" y2="25" transform={`rotate(${hrDeg} 50 50)`} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="50" y1="50" x2="50" y2="15" transform={`rotate(${minDeg} 50 50)`} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="50" cy="10" r="1.5" fill={color} transform={`rotate(${secDeg} 50 50)`} />
    </>
  );

  const renderCool = () => {
    const getDotPos = (deg, radius) => {
      const rad = (deg - 90) * (Math.PI / 180);
      return {
        x: 50 + radius * Math.cos(rad),
        y: 50 + radius * Math.sin(rad)
      };
    };

    const hrPos = getDotPos(hrDeg, 25);
    const minPos = getDotPos(minDeg, 35);
    const secPos = getDotPos(secDeg, 42);

    return (
      <>
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#4facfe', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" stroke="url(#grad1)" strokeWidth="2" fill="none" opacity="0.1" />

        {/* Hour Dot */}
        <circle
          cx={hrPos.x} cy={hrPos.y} r="4"
          fill="url(#grad1)"
        />

        {/* Minute Dot */}
        <circle
          cx={minPos.x} cy={minPos.y} r="3"
          fill={color}
          opacity="0.8"
        />

        {/* Second Dot */}
        <circle
          cx={secPos.x} cy={secPos.y} r="1.5"
          fill="#4facfe"
        />

        <circle cx="50" cy="50" r="1.5" fill={color} opacity="0.2" />
      </>
    );
  };

  const renderRetro = () => (
    <>
      <circle cx="50" cy="50" r="48" stroke={color} strokeWidth="3" fill="#f0f0f0" />
      <circle cx="50" cy="50" r="44" stroke="#000" strokeWidth="1" fill="none" />
      {[...Array(12)].map((_, i) => (
        <text
          key={i}
          x="50"
          y="15"
          transform={`rotate(${i * 30} 50 50)`}
          fill="#000"
          fontSize="10"
          fontWeight="bold"
          textAnchor="middle"
          style={{ transformOrigin: 'center', transform: `rotate(${-i * 30}deg)` }}
        >
          {i === 0 ? '12' : i}
        </text>
      ))}
      <line x1="50" y1="50" x2="50" y2="30" transform={`rotate(${hrDeg} 50 50)`} stroke="#000" strokeWidth="4" strokeLinecap="butt" />
      <line x1="50" y1="50" x2="50" y2="20" transform={`rotate(${minDeg} 50 50)`} stroke="#000" strokeWidth="2.5" strokeLinecap="butt" />
      <line x1="50" y1="50" x2="50" y2="10" transform={`rotate(${secDeg} 50 50)`} stroke="#d00" strokeWidth="1" />
      <circle cx="50" cy="50" r="2.5" fill="#000" />
    </>
  );

  const renderModern = () => (
    <>
      <circle cx="50" cy="50" r="48" stroke={color} strokeWidth="0.5" fill="none" opacity="0.1" />
      {[...Array(60)].map((_, i) => (
        <line
          key={i}
          x1="50" y1="2" x2="50" y2={i % 5 === 0 ? 6 : 4}
          transform={`rotate(${i * 6} 50 50)`}
          stroke={color} strokeWidth={i % 5 === 0 ? 1 : 0.5}
          opacity={i % 5 === 0 ? 0.5 : 0.1}
        />
      ))}
      <rect x="49" y="25" width="2" height="25" rx="1" transform={`rotate(${hrDeg} 50 50)`} fill={color} />
      <rect x="49.5" y="15" width="1" height="35" rx="0.5" transform={`rotate(${minDeg} 50 50)`} fill={color} />
      <circle cx="50" cy="50" r="1.5" fill="#4facfe" />
      <line x1="50" y1="50" x2="50" y2="5" transform={`rotate(${secDeg} 50 50)`} stroke="#4facfe" strokeWidth="0.5" opacity="0.8" />
    </>
  );

  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        {style === 'cyber' ? renderCyber() :
          style === 'minimalist' ? renderMinimalist() :
            style === 'cool' ? renderCool() :
              style === 'retro' ? renderRetro() :
                style === 'modern' ? renderModern() :
                  renderSimple()}
      </svg>
    </div>
  );
};

export default function Island() {
  const [time, setTime] = useState(null);
  const [mode, setMode] = useState("still"); // still, quick, large
  const [view, setView] = useState("home"); // home, music, ai, weather, search
  const lastInteractionRef = useRef(Date.now());
  const [autoRevertTime, setAutoRevertTime] = useState(Number(localStorage.getItem("auto-revert-time") || 5000));

  const [percent, setPercent] = useState(null);
  const [alert, setAlert] = useState(null);
  const [userText, setUserText] = useState("");
  const [aiAnswer, setAIAnswer] = useState("");
  const [browserSearch, setBrowserSearch] = useState("");
  const [batteryAlertsEnabled, setBatteryAlertsEnabled] = useState(localStorage.getItem("battery-alerts") !== "false");
  const [islandBorderEnabled, setIslandBorderEnabled] = useState(localStorage.getItem("island-border") === "true");
  const [islandBorderColor, setIslandBorderColor] = useState(localStorage.getItem("island-border-color") || "#FAFAFA");
  const [islandBorderThickness, setIslandBorderThickness] = useState(Number(localStorage.getItem("island-border-thickness") || 1));
  const [islandBorderStyle, setIslandBorderStyle] = useState(localStorage.getItem("island-border-style") || "solid");
  const [standbyBorderEnabled, setStandbyEnabled] = useState(localStorage.getItem("standby-mode") === "true");
  const [largeStandbyEnabled, setLargeStandbyEnabled] = useState(localStorage.getItem("large-standby-mode") === "true");
  const [hideNotActiveIslandEnabled, sethideNotActiveIslandEnabled] = useState(localStorage.getItem("hide-island-notactive") === "true");
  const [hourFormat, setHourFormat] = useState((localStorage.getItem("hour-format") || "12-hr") === "12-hr");
  const [weather, setWeather] = useState("");
  const [weatherCondition, setWeatherCondition] = useState("Clear");
  const [weatherUnit, setweatherUnit] = useState(localStorage.getItem("weather-unit") || "f");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "default");
  const [bgColor, setBgColor] = useState(localStorage.getItem("bg-color") || "#000000");
  const [textColor, setTextColor] = useState(localStorage.getItem("text-color") || "#FAFAFA");
  const [bgImage, setBgImage] = useState(localStorage.getItem("bg-image") || "");
  const [opacity, setOpacity] = useState(Number(localStorage.getItem("island-opacity") || 0.64));
  const [fontSize, setFontSize] = useState(Number(localStorage.getItem("island-font-size") || 14));
  const [cornerRadius, setCornerRadius] = useState(Number(localStorage.getItem("island-corner-radius") || 25));
  const [islandPosition, setIslandPosition] = useState(Number(localStorage.getItem("island-position") || 20));
  const [aiModel, setAiModel] = useState(localStorage.getItem("ai-model") || "openai/gpt-3.5-turbo");
  const [customModel, setCustomModel] = useState(localStorage.getItem("custom-model") || "");
  const [scrollAction, setScrollAction] = useState(localStorage.getItem("scroll-action") || "volume");
  const [clockStyle, setClockStyle] = useState(localStorage.getItem("clock-style") || "digital");
  const [analogStyle, setAnalogStyle] = useState(localStorage.getItem("analog-style") || "simple");
  const [clockFont, setClockFont] = useState(localStorage.getItem("clock-font") || "OpenRunde");
  const [showWatchInIdle, setShowWatchInIdle] = useState(localStorage.getItem("show-watch-idle") !== "false");
  const [showTimerBorder, setShowTimerBorder] = useState(localStorage.getItem("show-timer-border") !== "false");
  const [timerBorderColor, setTimerBorderColor] = useState(localStorage.getItem("timer-border-color") || "#FAFAFA");
  const [notificationsEnabled, setNotificationsEnabled] = useState(localStorage.getItem("notifications-enabled") !== "false");
  const [notchMode, setNotchMode] = useState(localStorage.getItem("notch-mode") === "true");
  const [scrollValue, setScrollValue] = useState(0); // For the visual bar
  const [showScrollOverlay, setShowScrollOverlay] = useState(false);
  const overlayTimeout = useRef(null);
  // browserSearch removed as per "remove app launcher" request implies simplification? No, user only said remove app launcher. Keeping browser search logic for now if needed, but UI might change.
  // Actually user said remove extra pages for music, settings, app launcher.

  const [shouldAnimateClock, setShouldAnimateClock] = useState(false);

  // Track previous mode to control animation
  const prevModeRef = useRef(mode);
  const timerRef = useRef(null);

  useEffect(() => {
    // If we just entered 'large' mode from something else, trigger animation
    if (mode === 'large' && prevModeRef.current !== 'large') {
      setShouldAnimateClock(true);
      // Reset after animation duration
      const t = setTimeout(() => setShouldAnimateClock(false), 500);
      return () => clearTimeout(t);
    }
    prevModeRef.current = mode;
  }, [mode]);

  const [clipboard, setClipboard] = useState([]);
  const [charging, setCharging] = useState(false);
  const [chargingAlert, setChargingAlert] = useState(false);
  const [spotifyTrack, setSpotifyTrack] = useState(null);

  const [prevView, setPrevView] = useState("home");
  const [showArrows, setShowArrows] = useState(localStorage.getItem("show-nav-arrows") === "true");
  const [infiniteScroll, setInfiniteScroll] = useState(localStorage.getItem("infinite-scroll") === "true");
  const [tempFiles, setTempFiles] = useState(() => {
    const saved = localStorage.getItem("dropbox-files");
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem("dropbox-files", JSON.stringify(tempFiles));
  }, [tempFiles]);
  const [isDraggingOver, setIsDraggingOver] = useState(null); // 'copy' or 'paste' or 'move'
  const [isDraggingOut, setIsDraggingOut] = useState(false);
  const isDraggingOutRef = useRef(false);
  const isMouseDown = useRef(false);
  const isMouseOver = useRef(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [messages, setMessages] = useState([]); // Current chat session
  const [clipboardHistory, setClipboardHistory] = useState([]);
  const [todos, setTodos] = useState([]);
  const [todoInput, setTodoInput] = useState("");
  const [weatherDetails, setWeatherDetails] = useState(null);
  const [pinnedUrls, setPinnedUrls] = useState(JSON.parse(localStorage.getItem("pinned-urls") || '["https://youtube.com", "https://whatsapp.com", "https://notion.so", "https://drive.google.com"]'));
  const [isEditingUrls, setIsEditingUrls] = useState(false);
  const [editingUrlIndex, setEditingUrlIndex] = useState(null);
  const [showInIslandSettings, setShowInIslandSettings] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [embeddedWebUrl, setEmbeddedWebUrl] = useState('');
  const [webviewReloadKey, setWebviewReloadKey] = useState(0);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(null);
  
  const [appShortcuts, setAppShortcuts] = useState(() => {
    const saved = localStorage.getItem("island-app-shortcuts");
    return saved ? JSON.parse(saved) : [];
  });

  // Auto-refresh missing icons on load
  useEffect(() => {
    const refreshIcons = async () => {
        if (!window.electronAPI?.getAppIcon) return;
        
        // Use a functional update or access current state if needed, 
        // but for mount effect, using the initial appShortcuts is fine.
        // We need to be careful not to create a race condition if user edits while this runs.
        // But since it runs on mount, it's likely fine.
        
        let updates = [...appShortcuts];
        let hasChanges = false;
        
        for (let i = 0; i < updates.length; i++) {
            if (!updates[i].icon && updates[i].path) {
                try {
                    console.log("Refreshing icon for:", updates[i].name);
                    const icon = await window.electronAPI.getAppIcon(updates[i].path);
                    if (icon) {
                        updates[i].icon = icon;
                        hasChanges = true;
                    }
                } catch (e) {
                    console.error("Failed to refresh icon:", e);
                }
            }
        }
        
        if (hasChanges) {
            setAppShortcuts(prev => {
                // Merge with current state to avoid overwriting new changes
                const newState = [...prev];
                updates.forEach((u, idx) => {
                    if (u.icon && newState[idx] && newState[idx].path === u.path) {
                        newState[idx].icon = u.icon;
                    }
                });
                return newState;
            });
        }
    };
    
    if (appShortcuts.length > 0) {
        refreshIcons();
    }
  }, []);

  const [showAppShortcutModal, setShowAppShortcutModal] = useState(false);
  const [newAppPath, setNewAppPath] = useState('');
  const [isEditingApps, setIsEditingApps] = useState(false);

  useEffect(() => {
    if (window.electronAPI?.onUpdateDownloaded) {
      window.electronAPI.onUpdateDownloaded(() => {
        setUpdateDownloaded(true);
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("island-app-shortcuts", JSON.stringify(appShortcuts));
  }, [appShortcuts]);
  
  const [layoutOrder, setLayoutOrder] = useState(() => {
    const saved = localStorage.getItem("island-layout-order");
    const defaultOrder = {
      pages: ['weather', 'app_shortcuts', 'search', 'home', 'music', 'ai', 'todo'],
      hiddenPages: [],
      home: ['clipboard', 'dropbox'],
      todo: ['calendar', 'timer'],
      weather: ['details', 'main'],
      search: ['urls', 'main']
    };
    if (!saved) return defaultOrder;
    const parsed = JSON.parse(saved);

    // Migration: Add new pages if missing
    let pages = parsed.pages || defaultOrder.pages;
    let hiddenPages = parsed.hiddenPages || defaultOrder.hiddenPages;

    // Remove bluetooth if present
    if (pages.includes('bluetooth')) {
        pages = pages.filter(p => p !== 'bluetooth');
    }
    if (hiddenPages.includes('bluetooth')) {
        hiddenPages = hiddenPages.filter(p => p !== 'bluetooth');
    }

    if (!pages.includes('app_shortcuts') && !hiddenPages.includes('app_shortcuts')) {
       // Add app_shortcuts left of search
       const searchIdx = pages.indexOf('search');
       if (searchIdx !== -1) pages.splice(searchIdx, 0, 'app_shortcuts');
       else pages.push('app_shortcuts');
    }

    // Ensure all keys exist
    return {
      pages: pages,
      hiddenPages: hiddenPages,
      home: parsed.home || defaultOrder.home,
      todo: parsed.todo || defaultOrder.todo,
      weather: parsed.weather || defaultOrder.weather,
      search: parsed.search || defaultOrder.search
    };
  });
  const [expandedSections, setExpandedSections] = useState({ pages: true });
  const settingsRef = useRef(null);

  // Auto-close settings on click outside and reset search
  useEffect(() => {
    function handleClickOutside(event) {
      if (showInIslandSettings && settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowInIslandSettings(false);
      }

      // If clicking outside while in search view, reset search
      if (view === 'search' && !event.target.closest('input')) {
        setSearchQuery('');
        setSearchResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showInIslandSettings, view]);

  // Fetch real search results using DuckDuckGo (free, no-key, includes URLs)
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const fetchResults = async () => {
      try {
        // DuckDuckGo API for "Instant Answers" and related topics
        const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json&no_html=1&skip_disambig=1`);
        const data = await response.json();

        let results = [];

        // 1. Check for "Abstract" (The main instant answer)
        if (data.AbstractText && data.AbstractURL) {
          results.push({
            title: data.AbstractSource || "Instant Answer",
            description: data.AbstractText,
            url: data.AbstractURL,
            isInstant: true
          });
        }

        // 2. Check "RelatedTopics"
        if (data.RelatedTopics && data.RelatedTopics.length > 0) {
          data.RelatedTopics.forEach(topic => {
            if (results.length < 5 && topic.Text && topic.FirstURL) {
              // DuckDuckGo related topics sometimes have an icon
              results.push({
                title: topic.Text.split(' - ')[0] || topic.Text,
                description: topic.Text,
                url: topic.FirstURL,
                icon: topic.Icon?.URL
              });
            }
          });
        }

        // 3. Fallback to Google Suggestions if no real results found
        if (results.length === 0) {
          const suggestRes = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(searchQuery)}`);
          const suggestData = await suggestRes.json();
          if (suggestData && suggestData[1]) {
            results = suggestData[1].slice(0, 5).map(s => ({
              title: s,
              description: `Search Google for "${s}"`,
              url: `https://www.google.com/search?q=${encodeURIComponent(s)}`,
              isSuggestion: true
            }));
          }
        }

        const finalResults = results.slice(0, 5);
        setSearchResults(finalResults);

        // Force a small delay then re-set results to ensure layout engine catches the height change
        // This fixes the issue where the bar sometimes fails to expand on the first try
        if (finalResults.length > 0) {
          setTimeout(() => {
            setSearchResults([...finalResults]);
          }, 50);
        }
      } catch (err) {
        console.error("Search fetch error:", err);
      }
    };

    const timer = setTimeout(fetchResults, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (mode !== 'large' || view !== 'search_urls') {
      setIsEditingUrls(false);
    }
    // Auto-close app edit mode when leaving the view or collapsing
    if (mode !== 'large' || view !== 'app_shortcuts') {
      setIsEditingApps(false);
    }
    // Reset calendar month when collapsing
    if (mode !== 'large') {
        const d = new Date();
        setCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  }, [mode, view]);

  const formatMonthTitle = (d) => d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const daysInMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const startWeekday = (d) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();
  const toIsoDate = (y, mIndex, day) => {
    const mm = String(mIndex + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  useEffect(() => {
    return () => {
      try {
        if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
        if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
      } catch {
      }
    };
  }, []);

  const stopRingingNow = async ({ isoDate, eventId, navigate } = {}) => {
    try {
      if (ringTimeoutRef.current) {
        clearTimeout(ringTimeoutRef.current);
        ringTimeoutRef.current = null;
      }
      if (ringIntervalRef.current) {
        clearInterval(ringIntervalRef.current);
        ringIntervalRef.current = null;
      }
      if (typeof stopBeepRef.current === 'function') {
        try { stopBeepRef.current(); } catch { }
        stopBeepRef.current = null;
      }
      setRingingEvent(null);

      if (isoDate && eventId) {
        await deleteCalendarEventByDate(isoDate, eventId);
      }

      if (navigate && isoDate) {
        setSelectedCalendarDate(isoDate);
        setMode('large');
        setView('todo_calendar_events');
        setLastInteraction(Date.now());
        await loadCalendarEvents();
      }
    } catch (err) {
      console.error('Failed to stop ringing:', err);
    }
  };
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef(null);
  const [timerTotalSeconds, setTimerTotalSeconds] = useState(0);
  const [watchMode, setWatchMode] = useState('timer'); // timer | stopwatch
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const stopwatchIntervalRef = useRef(null);
  const [showAddUrlModal, setShowAddUrlModal] = useState(false);
  const [newUrlData, setNewUrlData] = useState({ name: '', url: '' });

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
  const [calendarEvents, setCalendarEvents] = useState({});
  const [calendarEventInput, setCalendarEventInput] = useState("");
  const [calendarEventTimeInput, setCalendarEventTimeInput] = useState("");
  const [calendarEventAmPm, setCalendarEventAmPm] = useState("AM");
  const [googleCalendarUrl, setGoogleCalendarUrl] = useState(localStorage.getItem("google-calendar-ics-url") || "");
  const [editingCalendarEventAmPm, setEditingCalendarEventAmPm] = useState("AM");
  const [editingCalendarEventId, setEditingCalendarEventId] = useState(null);
  const [editingCalendarEventText, setEditingCalendarEventText] = useState("");
  const [editingCalendarEventTime, setEditingCalendarEventTime] = useState("");
  const [ringingEvent, setRingingEvent] = useState(null);
  const ringingPrevModeRef = useRef(null);
  const rungEventIdsRef = useRef(new Set());
  const ringTimeoutRef = useRef(null);
  const ringIntervalRef = useRef(null);
  // audioCtxRef removed per user request to remove audio for events
  const stopBeepRef = useRef(null);

  const [showControls, setShowControls] = useState(false);

  const getWeatherStyles = () => {
    const hour = new Date().getHours();
    const condition = weatherCondition.toLowerCase();
    let bgColor = "#4276a4ff"; // Default sky blue
    let iconColor = "white";

    // Sunrise/Morning: 5am - 8am
    if (hour >= 5 && hour < 8) {
      bgColor = "linear-gradient(180deg, #ff9d00 0%, #4facfe 100%)";
    }
    // Day: 8am - 5pm
    else if (hour >= 8 && hour < 17) {
      bgColor = "#4facfe"; // Sky blue
    }
    // Evening/Sunset: 5pm - 8pm
    else if (hour >= 15 && hour < 20) {
      bgColor = "linear-gradient(180deg, #4facfe 0%, #8b5cf6 100%)";
    }
    // Night: 8pm - 
    else {
      bgColor = "#1e1b4b"; // Dark purple
    }

    let icon = (hour >= 6 && hour < 18) ? <Sun size={48} color={iconColor} /> : <Moon size={48} color={iconColor} />;

    if (condition.includes("cloud")) {
      if (hour >= 6 && hour < 18) {
        bgColor = "#94a3b8";
        icon = (
          <div style={{ position: 'relative' }}>
            <Sun size={32} color={iconColor} style={{ position: 'absolute', top: -10, left: -10 }} />
            <Cloud size={48} color="white" />
          </div>
        );
      } else {
        bgColor = "#1e1b4b"; // Dark purple for cloudy night
        icon = (
          <div style={{ position: 'relative' }}>
            <Moon size={32} color={iconColor} style={{ position: 'absolute', top: -10, left: -10 }} />
            <Cloud size={48} color="rgba(255,255,255,0.7)" />
          </div>
        );
      }
    } else if (condition.includes("rain")) {
      bgColor = (hour >= 6 && hour < 18) ? "#475569" : "#1e1b4b"; // Dark purple for rainy night
      icon = <CloudRain size={48} color={iconColor} />;
    }

    return { bgColor, icon };
  };

  const handleAddTodo = async () => {
    if (!todoInput.trim()) return;
    const newTodos = [...todos, { id: Date.now(), text: todoInput, completed: false }];
    setTodos(newTodos);
    setTodoInput("");
    if (window.electronAPI?.saveTodo) {
      await window.electronAPI.saveTodo(newTodos);
    }
  };

  const loadCalendarEvents = async () => {
    try {
      if (window.electronAPI?.getCalendarEvents) {
        const data = await window.electronAPI.getCalendarEvents();
        if (data && typeof data === 'object') setCalendarEvents(data);
      }
    } catch (err) {
      console.error('Failed to load calendar events:', err);
    }
  };

  const saveCalendarEvents = async (next) => {
    setCalendarEvents(next);
    try {
      if (window.electronAPI?.saveCalendarEvents) {
        await window.electronAPI.saveCalendarEvents(next);
      }
    } catch (err) {
      console.error('Failed to save calendar events:', err);
    }
  };

  const convertTo24Hour = (timeStr, amPm) => {
    if (!timeStr) return "";
    const parts = timeStr.split(':');
    let h = parseInt(parts[0]);
    let m = parts[1] || '00';
    let s = parts[2] || '00';

    if (amPm === 'PM' && h < 12) h += 12;
    if (amPm === 'AM' && h === 12) h = 0;

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const parse24to12 = (time24) => {
    if (!time24) return { time: "", amPm: "AM" };
    const parts = time24.split(':');
    let h = parseInt(parts[0]);
    let m = parts[1] || '00';
    let s = parts[2] || '00';
    let amPm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return {
      time: `${String(h).padStart(2, '0')}:${m}${s !== '00' ? ':' + s : ''}`,
      amPm
    };
  };

  const addCalendarEvent = async () => {
    const text = calendarEventInput.trim();
    if (!text) return;

    let t = (calendarEventTimeInput || '').trim();
    if (t) {
      t = convertTo24Hour(t, calendarEventAmPm);
    }
    const time = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(t) ? t : '';

    const newEvent = { id: Date.now(), text, time };
    const next = { ...(calendarEvents || {}) };
    const existing = Array.isArray(next[selectedCalendarDate]) ? next[selectedCalendarDate] : [];
    next[selectedCalendarDate] = [...existing, newEvent];
    setCalendarEventInput("");
    setCalendarEventTimeInput("");
    await saveCalendarEvents(next);
  };

  const updateCalendarEvent = async (eventId, patch) => {
    const next = { ...(calendarEvents || {}) };
    const existing = Array.isArray(next[selectedCalendarDate]) ? next[selectedCalendarDate] : [];
    next[selectedCalendarDate] = existing.map(e => e.id === eventId ? { ...e, ...patch } : e);
    await saveCalendarEvents(next);
  };

  const deleteCalendarEventByDate = async (isoDate, eventId) => {
    const next = { ...(calendarEvents || {}) };
    const existing = Array.isArray(next[isoDate]) ? next[isoDate] : [];
    next[isoDate] = existing.filter(e => e.id !== eventId);
    if (next[isoDate].length === 0) delete next[isoDate];
    await saveCalendarEvents(next);
  };

  const formatTimeInput = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}:${digits.slice(2)}`;
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4, 6)}`;
  };

  const getTodayIso = () => {
    const d = new Date();
    return toIsoDate(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const playTimerBeepFor10s = () => {
    console.log('Playing reminder audio from local file:', remainderSoundLocal);
    const audio = new Audio(remainderSoundLocal);
    audio.loop = true;
    audio.volume = 1.0;
    audio.muted = false;

    // Explicitly load and play
    audio.load();
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => console.log('Playing local reminder audio SUCCESS'))
        .catch(err => {
          console.error('Local audio playback failed:', err);
        });
    }

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  };

  const [isRingerHovered, setIsRingerHovered] = useState(false);

  const [isWatchHovered, setIsWatchHovered] = useState(false);

  const startRinging = async ({ isoDate, ev }) => {
    if (!ev?.id) return;
    if (rungEventIdsRef.current.has(ev.id)) return;

    rungEventIdsRef.current.add(ev.id);
    ringingPrevModeRef.current = mode;
    setRingingEvent({ id: ev.id, text: ev.text, time: ev.time || '', remainingMs: 10000, isoDate });
    setLastInteraction(Date.now());
    notifyUser("Calendar reminder", `${ev.text}${ev.time ? ` • ${ev.time}` : ""}`);

    if (mode !== 'large') {
      setMode('quick');
    }
    if (window.electronAPI) window.electronAPI.setIgnoreMouseEvents(false, false);

    // Audio for events removed per user request
    // const stopBeep = playTimerBeepFor10s();
    // stopBeepRef.current = stopBeep;

    if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
    ringIntervalRef.current = setInterval(() => {
      setRingingEvent(prev => {
        if (!prev) return prev;
        const nextMs = Math.max(0, prev.remainingMs - 250);
        return { ...prev, remainingMs: nextMs };
      });
    }, 250);

    if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
    ringTimeoutRef.current = setTimeout(async () => {
      await stopRingingNow({ isoDate, eventId: ev.id });

      if (!isMouseOver.current) {
        setMode('still');
        setView('home');
        if (window.electronAPI && !isMouseDown.current) {
          window.electronAPI.setIgnoreMouseEvents(true, true);
        }
      }
    }, 10000);
  };

  const toggleTodo = async (id) => {
    const newTodos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTodos(newTodos);
    if (window.electronAPI?.saveTodo) {
      await window.electronAPI.saveTodo(newTodos);
    }
  };

  const deleteTodo = async (id) => {
    const newTodos = todos.filter(t => t.id !== id);
    setTodos(newTodos);
    if (window.electronAPI?.saveTodo) {
      await window.electronAPI.saveTodo(newTodos);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setUserText("");
    setShowHistory(false);
    setActiveSessionId(null);
  };

  // Dropbox state and refresh removed

  let isPlaying = spotifyTrack?.state === 'playing';

  useEffect(() => {
    const loadData = async () => {
      if (window.electronAPI?.getTodo) {
        const savedTodos = await window.electronAPI.getTodo();
        setTodos(savedTodos);
      }
    };
    loadData();

    const handleDown = () => { isMouseDown.current = true; };
    const handleUp = () => {
      isMouseDown.current = false;
      if (!isMouseOver.current && window.electronAPI) {
        window.electronAPI.setIgnoreMouseEvents(true, true);
      }
    };
    const handleWheel = (e) => {
      try {
        // Use the latest mode from state, but since we're in a [] effect, 
        // we'll use a trick or just check the DOM if needed. 
        // Actually, let's fix the dependency array for this effect.
        if (isMouseOver.current) {
          // We need to know if we are in large mode. 
          // Since this effect has an empty dependency array, 'mode' is stale.
          const isLarge = document.querySelector('.island-container')?.classList.contains('large');
          if (isLarge) return;

          const direction = e.deltaY < 0 ? 'up' : 'down';
          if (scrollAction === 'volume') {
            if (window.electronAPI && typeof window.electronAPI.changeVolume === 'function') {
              window.electronAPI.changeVolume(direction).then((percent) => {
                if (typeof percent === 'number' && Number.isFinite(percent)) {
                  setScrollValue(Math.min(Math.max(percent, 0), 100));
                } else {
                  // Fallback when the main process can't return the real volume percent.
                  // Keep the overlay roughly aligned by stepping a small amount.
                  setScrollValue(prev => (direction === 'up' ? Math.min(prev + 2, 100) : Math.max(prev - 2, 0)));
                }
              }).catch(err => {
                console.error("Volume IPC failed:", err);
              });
              setShowScrollOverlay(true);
              if (overlayTimeout.current) clearTimeout(overlayTimeout.current);
              overlayTimeout.current = setTimeout(() => setShowScrollOverlay(false), 1500);
            }
          } else if (scrollAction === 'brightness') {
            if (window.electronAPI && typeof window.electronAPI.changeBrightness === 'function') {
              window.electronAPI.changeBrightness(direction).then((percent) => {
                if (typeof percent === 'number' && Number.isFinite(percent)) {
                  setScrollValue(Math.min(Math.max(percent, 0), 100));
                }
              }).catch(err => {
                console.error("Brightness IPC failed:", err);
              });
              setShowScrollOverlay(true);
              if (overlayTimeout.current) clearTimeout(overlayTimeout.current);
              overlayTimeout.current = setTimeout(() => setShowScrollOverlay(false), 1500);
            }
          }
        }
      } catch (err) {
        console.error("Wheel event error:", err);
      }
    };
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('wheel', handleWheel);
    return () => {
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  useEffect(() => {
    loadCalendarEvents();
  }, []);

  useEffect(() => {
    if (view === 'todo_calendar' || view === 'todo_calendar_events') {
      loadCalendarEvents();
    }
  }, [view]);

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        const nowHMS = `${hh}:${mm}:${ss}`;

        const todayIso = toIsoDate(now.getFullYear(), now.getMonth(), now.getDate());
        const todays = Array.isArray(calendarEvents?.[todayIso]) ? calendarEvents[todayIso] : [];
        const due = todays.find(ev => {
          if (!ev?.time) return false;
          if (/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(ev.time)) return ev.time === nowHMS;
          if (/^([01]\d|2[0-3]):[0-5]\d$/.test(ev.time)) return ev.time === `${hh}:${mm}` && ss === '00';
          return false;
        });
        if (due) startRinging({ isoDate: todayIso, ev: due });
      } catch (err) {
        console.error('Event ringing check failed:', err);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [calendarEvents, mode]);

  // Auto-revert view when island collapses
  useEffect(() => {
    if (mode !== 'large' && view !== 'home' && view !== 'dropbox') {
      setView('home');
    }
  }, [mode, view]);
  // Timer and Stopwatch Interval Management
  useEffect(() => {
    // Clear any existing intervals first
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (stopwatchIntervalRef.current) {
      clearInterval(stopwatchIntervalRef.current);
      stopwatchIntervalRef.current = null;
    }

    // Mutual exclusivity: if both are somehow true, prioritize timer
    if (isTimerRunning && isStopwatchRunning) {
      setIsStopwatchRunning(false);
      return; // The next effect run (due to state change) will handle the timer
    }

    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            notifyUser("Timer finished", "Your Island timer has completed.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (isStopwatchRunning) {
      stopwatchIntervalRef.current = setInterval(() => {
        setStopwatchSeconds(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current);
        stopwatchIntervalRef.current = null;
      }
    };
  }, [isTimerRunning, isStopwatchRunning]);

  useEffect(() => {
    if (!isTimerRunning && !isStopwatchRunning && timerSeconds === 0 && stopwatchSeconds === 0) {
      setIsWatchHovered(false);
    }
  }, [isTimerRunning, isStopwatchRunning, timerSeconds, stopwatchSeconds]);

  useEffect(() => {
    if (mode === 'large') {
      setIsWatchHovered(false);
    }
  }, [mode]);

  // Dynamic Width/Height based on mode and view - INCREASED FOR AI/DROPBOX
  const { width, height } = (() => {
    if (showInIslandSettings && mode === 'large') {
      return { width: 450, height: 400 };
    }
    if (mode === "large") {
      switch (view) {
        case 'clipboard': return { width: 380, height: 290 };
        case 'ai':
        case 'dropbox': return { width: 420, height: 380 };
        case 'todo': return { width: 420, height: 320 };
        case 'todo_timer': return { width: 320, height: 260 };
        case 'todo_calendar': return { width: 360, height: 320 };
        case 'todo_calendar_events': return { width: 430, height: 340 };
        case 'weather': return { width: 350, height: 220 };
        case 'weather_details': return { width: 350, height: 200 };
        case 'app_shortcuts': return { width: 420, height: 340 };
        case 'search_urls': return { width: 400, height: 210 };
        case 'search':
          if (embeddedWebUrl) return { width: 760, height: 540 };
          return { width: 420, height: searchResults.length > 0 ? (searchResults.length * 65 + 100) : 180 };
        case 'settings': return { width: 420, height: 380 };
        default: return { width: 400, height: 200 };
      }
    }
    if ((isTimerRunning || isStopwatchRunning || timerSeconds > 0 || stopwatchSeconds > 0) && mode !== 'large') {
      return isWatchHovered ? { width: 370, height: 43 } : { width: 230, height: 43 };
    }
    if (mode === "quick" || isPlaying) {
      return { width: 300, height: 43 };
    }
    if (notchMode) return { width: 140, height: 30 };
    return { width: 175, height: 43 };
  })();

  // Remove obsolete Quick Apps state


  //User age
  useEffect(() => {
    if (!localStorage.getItem('newuser')) {
      localStorage.setItem('newuser', 'true');
    }
    refreshTempFiles();
  }, []);

  // Handle Window Blur/Focus
  useEffect(() => {
    const handleBlur = () => {
      if (autoRevertTime <= 0 || isDraggingOutRef.current) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        // Always close in-island settings on blur
        setShowInIslandSettings(false);

        if (view !== 'home' && view !== 'dropbox') {
          setMode('still');
          setView('home');
          setBrowserSearch('');
          setSearchQuery('');
          setSearchResults([]);
        }
      }, autoRevertTime);
    };

    const handleFocus = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [view, autoRevertTime]);

  // Inactivity Revert (while focused)
  useEffect(() => {
    if (view === 'home' || view === 'dropbox' || autoRevertTime <= 0 || isDraggingOut) return;

    const checkInactivity = () => {
      const diff = Date.now() - lastInteractionRef.current;
      if (diff >= autoRevertTime) {
        setView('home');
        setMode('still');
      }
    };

    const interval = setInterval(checkInactivity, 1000);
    return () => clearInterval(interval);
  }, [view, autoRevertTime]);

  // Sync settings across windows
  // localStorage defaults and sync
  useEffect(() => {
    const syncSettings = async () => {
      // 1. First, apply hardcoded defaults for any missing keys
      const defaults = {
        "battery-alerts": "true",
        "default-tab": "2",
        "island-border": "false",
        "island-border-color": "#FAFAFA",
        "island-border-thickness": "1",
        "island-border-style": "solid",
        "hide-island-notactive": "false",
        "standby-mode": "false",
        "hour-format": "12-hr",
        "bg-color": "#000000",
        "text-color": "#FAFAFA",
        "weather-unit": "f",
        "island-opacity": "0.64",
        "island-font-size": "14",
        "island-corner-radius": "25",
        "island-position": "20",
        "ai-model": "openai/gpt-3.5-turbo",
        "infinite-scroll": "false",
        "auto-revert-time": "10000",
        "scroll-action": "volume",
        "notifications-enabled": "true",
        "notch-mode": "false"
      };

      Object.entries(defaults).forEach(([key, value]) => {
        if (localStorage.getItem(key) === null) {
          localStorage.setItem(key, value);
        }
      });

      // 2. Then, override with remote settings if they exist
      if (window.electronAPI?.getSettings) {
        const remoteSettings = await window.electronAPI.getSettings();
        if (remoteSettings && Object.keys(remoteSettings).length > 0) {
          Object.entries(remoteSettings).forEach(([key, val]) => {
            localStorage.setItem(key, val);
          });
        }
      }

      // 3. Finally, update the React state from the consolidated localStorage
      setBatteryAlertsEnabled(localStorage.getItem("battery-alerts") !== "false");
      setIslandBorderEnabled(localStorage.getItem("island-border") === "true");
      setIslandBorderColor(localStorage.getItem("island-border-color") || "#FAFAFA");
      setIslandBorderThickness(Number(localStorage.getItem("island-border-thickness") || 1));
      setIslandBorderStyle(localStorage.getItem("island-border-style") || "solid");
      setStandbyEnabled(localStorage.getItem("standby-mode") === "true");
      setLargeStandbyEnabled(localStorage.getItem("large-standby-mode") === "true");
      sethideNotActiveIslandEnabled(localStorage.getItem("hide-island-notactive") === "true");
      setHourFormat((localStorage.getItem("hour-format") || "12-hr") === "12-hr");
      setweatherUnit(localStorage.getItem("weather-unit") || "f");
      setTheme(localStorage.getItem("theme") || "default");
      setShowArrows(localStorage.getItem("show-nav-arrows") === "true");
      setInfiniteScroll(localStorage.getItem("infinite-scroll") === "true");
      setBgColor(localStorage.getItem("bg-color") || "#000000");
      setTextColor(localStorage.getItem("text-color") || "#FAFAFA");
      setBgImage(localStorage.getItem("bg-image") || "");
      setAutoRevertTime(Number(localStorage.getItem("auto-revert-time") || 10000));
      setOpacity(Number(localStorage.getItem("island-opacity") || 0.64));
      setFontSize(Number(localStorage.getItem("island-font-size") || 14));
      setCornerRadius(Number(localStorage.getItem("island-corner-radius") || 25));
      setIslandPosition(Number(localStorage.getItem("island-position") || 20));
      setAiModel(localStorage.getItem("ai-model") || "openai/gpt-3.5-turbo");
      setCustomModel(localStorage.getItem("custom-model") || "");
      setScrollAction(localStorage.getItem("scroll-action") || "volume");
      setClockStyle(localStorage.getItem("clock-style") || "digital");
      setAnalogStyle(localStorage.getItem("analog-style") || "simple");
      setClockFont(localStorage.getItem("clock-font") || "OpenRunde");
      setShowWatchInIdle(localStorage.getItem("show-watch-idle") !== "false");
      setShowTimerBorder(localStorage.getItem("show-timer-border") !== "false");
      setTimerBorderColor(localStorage.getItem("timer-border-color") || "#FAFAFA");
      setNotificationsEnabled(localStorage.getItem("notifications-enabled") !== "false");
      setNotchMode(localStorage.getItem("notch-mode") === "true");
    };

    syncSettings();
    window.addEventListener('storage', syncSettings);
    return () => window.removeEventListener('storage', syncSettings);
  }, []);

  useEffect(() => {
    if (!notificationsEnabled || typeof Notification === "undefined") return;
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => { });
    }
  }, [notificationsEnabled]);

  const handleBatteryAlertsChange = (e) => {
    const value = e.target.value === "true";
    setBatteryAlertsEnabled(value);
    localStorage.setItem("battery-alerts", value ? "true" : "false");
  };

  const handleResetSettings = () => {
    if (window.confirm("Are you sure you want to reset all settings to default?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleIslandBorderChange = (e) => {
    const value = e.target.value === "true";
    setIslandBorderEnabled(value);
    localStorage.setItem("island-border", value ? "true" : "false");
  };

  const handleStandbyChange = (e) => {
    const value = e.target.value === "true";
    setStandbyEnabled(value);
    localStorage.setItem("standby-mode", value ? "true" : "false");
  };

  const handleLargeStandbyChange = (e) => {
    const value = e.target.value === "true";
    setLargeStandbyEnabled(value);
    localStorage.setItem("large-standby-mode", value ? "true" : "false");
  };

  const handleHourFormatChange = (e) => {
    const value = e.target.value;
    setHourFormat(value === "12-hr");
    localStorage.setItem("hour-format", value);
  };

  const handlehideNotActiveIslandChange = (e) => {
    const value = e.target.value === "true";
    sethideNotActiveIslandEnabled(value);
    localStorage.setItem("hide-island-notactive", value ? "true" : "false");
  };

  const handleWeatherUnitChange = (e) => {
    const value = e.target.value === "c" ? "c" : "f";
    setweatherUnit(value);
    localStorage.setItem("weather-unit", value);
  };

  async function askAI() {
    try {
      const apiKey = (localStorage.getItem("openrouter-key") || "").trim();

      if (!apiKey) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Enter your API key in settings" }]);
        return;
      }

      if (!userText.trim()) return;

      const currentQuestion = userText;
      setUserText(""); // Clear input immediately

      // Add user message
      setMessages(prev => [...prev, { role: 'user', content: currentQuestion }]);

      // Add placeholder for AI response
      setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

      const openai = new OpenAI({
        apiKey,
        baseURL: "https://openrouter.ai/api/v1",
        dangerouslyAllowBrowser: true,
        defaultHeaders: {
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "Island",
        }
      });

      // Construct messages for API
      // We should include history context but exclude the just-added placeholders (which are async state updates anyway)
      // The 'messages' variable here is from the render scope, so it doesn't include the lines we just called setMessages for.
      // So 'messages' is exactly the history we want.
      
      const apiMessages = [
          ...messages.map(m => ({ role: m.role, content: m.content })),
          {
            role: "user",
            content: `Users question: ${currentQuestion}. Answer the users question in a short paragraph, 3-4 sentences. If the question is straight forward answer the question in a short 2 sentences.`
          }
      ];

      const stream = await openai.chat.completions.create({
        model: aiModel === 'custom' ? customModel : aiModel,
        messages: apiMessages,
        stream: true,
      });

      let fullText = "";

      // Determine or create session ID
      let sessionId = activeSessionId;
      if (!sessionId) {
          sessionId = Date.now().toString();
          setActiveSessionId(sessionId);
      }

      for await (const chunk of stream) {
        const delta = chunk?.choices?.[0]?.delta?.content || "";
        if (delta) {
          fullText += delta;
          setMessages(prev => {
            const newHistory = [...prev];
            const lastMsg = newHistory[newHistory.length - 1];
            if (lastMsg.role === 'assistant') {
              lastMsg.content += delta;
            }
            return newHistory;
          });
        }
      }

      if (!fullText) {
        setMessages(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].content = "No response streamed.";
          return newHistory;
        });
      } else {
        // Save to history (save the entire session)
        if (window.electronAPI?.saveChatHistory) {
          // Construct the full session object
          // We need the latest messages state, which includes the new response.
          // Since setMessages is async, we can't trust 'messages' variable here to have the very last update immediately.
          // However, we can reconstruct it from 'messages' + the new response.
          // Wait, 'messages' variable in this closure is stale (from render start).
          // We need to use functional update to get previous messages, but we can't get the result out easily.
          // Better approach: We know 'messages' (at start of fn) + user msg + assistant msg.
          
          const updatedMessages = [
              ...messages, 
              { role: 'user', content: currentQuestion }, 
              { role: 'assistant', content: fullText }
          ];
          
          const sessionTitle = messages.length === 0 ? currentQuestion : (messages[0].content || currentQuestion);

          await window.electronAPI.saveChatHistory({
            id: sessionId,
            title: sessionTitle.substring(0, 50) + (sessionTitle.length > 50 ? "..." : ""),
            messages: updatedMessages
          });
        }
      }
    } catch (err) {
      const message =
        err?.message ||
        (typeof err === "string" ? err : "Unexpected error occurred.");
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${message}` }]);
    }
  }

  // --- Chat History ---
  useEffect(() => {
    if (showHistory && window.electronAPI?.getChatHistory) {
      window.electronAPI.getChatHistory().then(setChatHistory);
    }
  }, [showHistory]);

  const handleClearHistory = async () => {
    if (window.electronAPI?.clearChatHistory) {
      await window.electronAPI.clearChatHistory();
      setChatHistory([]);
    }
  };

  // --- Clipboard History Logic ---
  useEffect(() => {
    if (window.electronAPI?.getClipboardHistory) {
      window.electronAPI.getClipboardHistory().then(setClipboardHistory);
    }
    if (window.electronAPI?.onClipboardUpdate) {
      window.electronAPI.onClipboardUpdate((history) => {
        setClipboardHistory(history);
      });
    }
  }, []);

  const handleCopyFromHistory = (item) => {
    if (window.electronAPI?.copyToClipboard) {
      window.electronAPI.copyToClipboard(item);
    }
  };

  const handleClearClipboard = () => {
    if (window.electronAPI?.clearClipboardHistory) {
      window.electronAPI.clearClipboardHistory();
    }
  };

  const handleDeleteClipboardItem = (e, item) => {
    e.stopPropagation();
    if (window.electronAPI?.deleteClipboardItem) {
      window.electronAPI.deleteClipboardItem(item.timestamp);
    }
  };

  // --- Dropbox Logic ---
  const refreshTempFiles = () => {
    const saved = localStorage.getItem("dropbox-files");
    setTempFiles(saved ? JSON.parse(saved) : []);
  };

  useEffect(() => {
    if (window.electronAPI?.onDragFinished) {
      window.electronAPI.onDragFinished(async (filePath) => {
        // If it was a move operation, remove it from our list as it was "moved" to a new location
        const fileObj = tempFiles.find(f => f.path === filePath);
        if (fileObj && fileObj.type === 'move') {
          setTempFiles(prev => prev.filter(f => f.path !== filePath));
        }

        // RESTORE mouse events after drag finishes
        if (window.electronAPI?.setIgnoreMouseEvents) {
          window.electronAPI.setIgnoreMouseEvents(false);
        }
      });
    }
  }, [tempFiles]);

  const handleDropToCopy = async (e) => {
    e.preventDefault();
    setIsDraggingOver(null);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const newFiles = Array.from(files).map(f => ({
        name: f.name,
        path: window.electronAPI.getPathForFile(f),
        type: 'copy'
      }));
      setTempFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDropToMove = async (e) => {
    e.preventDefault();
    setIsDraggingOver(null);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const newFiles = Array.from(files).map(f => ({
        name: f.name,
        path: window.electronAPI.getPathForFile(f),
        type: 'move'
      }));
      setTempFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDragStartFromPaste = (e, file) => {
    e.preventDefault();
    if (window.electronAPI?.startDrag) {
      setIsDraggingOut(true);
      isDraggingOutRef.current = true;
      // Logic moved to main.js for better synchronization with OS drag state
      window.electronAPI.startDrag(file.path);
    }
  };

  const handleClear = (fileToRemove = null) => {
    if (fileToRemove) {
      setTempFiles(prev => prev.filter(f => f.path !== fileToRemove.path));
    } else {
      setTempFiles([]);
    }
  };

  // Get battery info
  useEffect(() => {
    let battery;
    const updateBattery = (batt) => {
      setPercent(Math.round(batt.level * 100));
      setCharging(batt.charging);
    };

    const setupBattery = async () => {
      if (!("getBattery" in navigator)) {
        setPercent("Battery not supported");
        return;
      }
      try {
        battery = await navigator.getBattery();
        updateBattery(battery);

        battery.addEventListener("chargingchange", () => updateBattery(battery));
        battery.addEventListener("levelchange", () => updateBattery(battery));
      } catch (err) {
        console.error("Battery API error:", err);
        setPercent("Battery unavailable");
      }
    };

    setupBattery();

    // Fallback polling every 10 mins as requested
    const interval = setInterval(() => {
      if (battery) updateBattery(battery);
    }, 600000);

    return () => {
      clearInterval(interval);
      if (battery) {
        battery.removeEventListener("chargingchange", () => updateBattery(battery));
        battery.removeEventListener("levelchange", () => updateBattery(battery));
      }
    };
  }, []);

  // Battery alerts
  useEffect(() => {
    if (
      (percent === 20 || percent === 15 || percent === 10 || percent === 5 || percent === 3) &&
      localStorage.getItem("battery-alerts") === "true"
    ) {
      setMode("quick");
      setAlert(true);
      const timerId = setTimeout(() => {
        setAlert(null);
        if (!standbyBorderEnabled && !largeStandbyEnabled) setMode("still");
      }, 5000);
      return () => clearTimeout(timerId);
    }
  }, [percent, standbyBorderEnabled, largeStandbyEnabled]);

  useEffect(() => {
    if (
      (charging === true) &&
      localStorage.getItem("battery-alerts") === "true"
    ) {
      setMode("quick");
      setChargingAlert(true);
      const timerId = setTimeout(() => {
        setMode("still");
        setChargingAlert(false);
      }, 3000);
      return () => {
        clearTimeout(timerId);
      };
    }
  }, [charging]);


  // Get time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0");
      if (hourFormat) {
        hours = hours % 12;
        hours = (hours === 0 ? 12 : hours);
        setTime(`${hours}:${minutes}`);
      } else {
        setTime(`${String(hours).padStart(2, '0')}:${minutes}`);
      }
    };
    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, [hourFormat]);

  // Standby Mode
  useEffect(() => {
    if (isDraggingOutRef.current) return;
    if (standbyBorderEnabled) {
      if (mode !== 'quick') setMode('quick');
    } else if (largeStandbyEnabled) {
      if (mode !== 'large') setMode('large');
    } else {
      if (mode !== 'still') setMode('still');
    }
  }, [standbyBorderEnabled, largeStandbyEnabled, isDraggingOut]);

  // Get Island Details (Copyright/Version)
  const getBatteryIcon = () => {
    const iconColor = percent >= 60 ? "#4ade80" : percent >= 30 ? "#fbbf24" : "#ef4444";
    if (percent >= 90) return <BatteryFull size={14} color={iconColor} />;
    if (percent >= 40) return <BatteryMedium size={14} color={iconColor} />;
    return <BatteryLow size={14} color={iconColor} />;
  };

  const formatTimer = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleWeatherFetch = async () => {
    const loc = localStorage.getItem("location");
    if (!loc) return;
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=0b18c67c443543e0a6045401250911&q=${loc}&aqi=yes`
      );
      const data = await response.json();
      setWeatherDetails(data.current);
      const unit = localStorage.getItem("weather-unit");
      const key = unit === "f" ? "temp_f" : "temp_c";
      if (data?.current?.[key] !== undefined) {
        setWeather(Math.round(data.current[key]));
      }
      if (data?.current?.condition?.text) {
        setWeatherCondition(data.current.condition.text);
      }
    } catch (err) {
      console.error("Weather fetch error:", err);
    }
  };

  // Get Weather
  useEffect(() => {
    // Initial fetch
    handleWeatherFetch();

    // Set up interval for background updates (10 mins)
    const interval = setInterval(handleWeatherFetch, 600000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (window.electronAPI?.onDragFinished) {
      window.electronAPI.onDragFinished(() => {
        setIsDraggingOut(false);
        isDraggingOutRef.current = false;
      });
    }
  }, []);

  // Listen for storage events (including location changes) specifically to re-fetch weather
  useEffect(() => {
    const handleStorageChange = (e) => {
      // If we just reset settings or the location changed, fetch weather immediately
      if (!e.key || e.key === 'location' || e.key === 'weather-unit') {
        handleWeatherFetch();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Set theme
  useEffect(() => {
    if (theme === "sleek-black") {
      localStorage.setItem("bg-color", `rgba(0, 0, 0, ${opacity})`);
      localStorage.setItem("text-color", "rgba(255, 255, 255)");
    } else if (theme === "win95") {
      localStorage.setItem("bg-color", "rgba(195, 195, 195)");
      localStorage.setItem("text-color", "rgba(0, 0, 0)");
    } else if (theme === "invisible") {
      localStorage.setItem("bg-image", "none");
      localStorage.setItem("bg-color", "rgba(255, 255, 255, 0)");
    } else if (theme === "none") {
    }
  }, [theme, opacity]);

  const notifyUser = (title, body) => {
    if (!notificationsEnabled || typeof Notification === "undefined") return;
    try {
      if (Notification.permission === "granted") {
        new Notification(title, { body, silent: false });
      }
    } catch (err) {
      console.error("Notification error:", err);
    }
  };

  const parseICSDate = (value) => {
    if (!value) return null;
    const raw = String(value).trim();
    const m = raw.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?)?/);
    if (!m) return null;
    const [, y, mo, d, hh = "", mm = "", ss = ""] = m;
    return {
      isoDate: `${y}-${mo}-${d}`,
      time: hh ? `${hh}:${mm || "00"}:${ss || "00"}` : ""
    };
  };

  const importGoogleCalendar = async () => {
    const url = (googleCalendarUrl || "").trim();
    if (!url) return;
    try {
      const res = await fetch(url);
      const raw = await res.text();
      if (!res.ok || !raw.includes("BEGIN:VEVENT")) throw new Error("Invalid ICS feed");

      const lines = raw.split(/\r?\n/);
      const importedByDate = {};
      let current = null;

      for (const line of lines) {
        if (line.startsWith("BEGIN:VEVENT")) {
          current = {};
        } else if (line.startsWith("END:VEVENT")) {
          if (current?.summary && current?.start?.isoDate) {
            const iso = current.start.isoDate;
            importedByDate[iso] = importedByDate[iso] || [];
            importedByDate[iso].push({
              id: Date.now() + Math.floor(Math.random() * 1000000),
              text: `[GCal] ${current.summary}`,
              time: current.start.time || ""
            });
          }
          current = null;
        } else if (current) {
          if (line.startsWith("SUMMARY:")) current.summary = line.slice(8).trim();
          if (line.startsWith("DTSTART")) {
            const val = line.split(":").slice(1).join(":").trim();
            current.start = parseICSDate(val);
          }
        }
      }

      const next = { ...(calendarEvents || {}) };
      Object.entries(importedByDate).forEach(([date, events]) => {
        const existing = Array.isArray(next[date]) ? next[date] : [];
        const existingKeys = new Set(existing.map(ev => `${ev.text}@@${ev.time || ""}`));
        const deduped = events.filter(ev => !existingKeys.has(`${ev.text}@@${ev.time || ""}`));
        next[date] = [...existing, ...deduped];
      });

      await saveCalendarEvents(next);
      localStorage.setItem("google-calendar-ics-url", url);
      notifyUser("Google Calendar imported", "Events were added to your Island calendar.");
    } catch (err) {
      console.error("Failed to import Google Calendar ICS:", err);
      notifyUser("Google Calendar import failed", "Please verify your public ICS URL.");
    }
  };

  // Browser Search Feature
  function resolveSearchInput(val) {
    const trimmed = val.trim();
    if (!trimmed) return { url: '', isDirectUrl: false };
    const isDirectUrl = trimmed.includes('.') && !trimmed.includes(' ');
    if (isDirectUrl) {
      return {
        url: trimmed.startsWith('http') ? trimmed : `https://${trimmed}`,
        isDirectUrl: true
      };
    }
    return {
      url: `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`,
      isDirectUrl: false
    };
  }

  function searchBrowser() {
    const trimmedSearch = browserSearch.trim();
    if (!trimmedSearch) return;
    let urlToOpen;
    if (trimmedSearch.includes(".")) {
      const hasProtocol = /^https?:\/\//i.test(trimmedSearch);
      urlToOpen = hasProtocol ? trimmedSearch : `https://${trimmedSearch}`;
    } else {
      const encodedQuery = encodeURIComponent(trimmedSearch);
      urlToOpen = `https://www.google.com/search?q=${encodedQuery}`;
    }

    if (window.electronAPI?.openExternal) {
      window.electronAPI.openExternal(urlToOpen);
    } else {
      window.open(urlToOpen, "_blank");
    }
  }

  // Clipboard
  async function getClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      setClipboard((prevClipboard) => {
        if (prevClipboard[prevClipboard.length - 1] === text) {
          return prevClipboard;
        }
        return [...prevClipboard, text];
      });
    } catch (error) {
      console.log(
        `Error reading clipboard: ${error.toString()}`,
      );
    }
  }

  useEffect(() => {
    // Immediate initial fetch
    getClipboard();

    // Set up interval (5s)
    const interval = setInterval(getClipboard, 5000);

    return () => clearInterval(interval);
  }, []);





  // Now Playing
  useEffect(() => {
    const fetchMedia = async () => {
      if (window.electronAPI?.getSystemMedia) {
        try {
          const track = await window.electronAPI.getSystemMedia();
          setSpotifyTrack(track);
        } catch (e) {
          // console.error("[Media Debug] Error:", e);
        }
      } else {
        // console.log("[Media Debug] getSystemMedia not available");
      }
    };

    // PowerShell polling removed to fix lag. 
    // Spotify polling is handled separately or via events.
    return () => { };
  }, []);

  function copyToClipboard(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      return navigator.clipboard.writeText(text);
    }
  }

  // Keyboard Shortcuts and Navigation
  // Auto-revert to main view after inactivity
  useEffect(() => {
    if (mode === "still") return;

    if (!autoRevertTime || autoRevertTime < 1000) return;

    const checkActivity = setInterval(() => {
      if (Date.now() - lastInteractionRef.current > autoRevertTime) {
        setMode("still");
        setView("home");
      }
    }, 1000);

    return () => clearInterval(checkActivity);
  }, [mode, autoRevertTime]);

  // Track interaction
  const interact = useRef(() => {
    lastInteractionRef.current = Date.now();
  }).current;

  useEffect(() => {
    const handleMove = () => {
      // Only update if it's been at least 100ms since last interaction to prevent spamming
      if (Date.now() - lastInteractionRef.current > 100) {
        interact();
      }
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('keydown', interact);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('keydown', interact);
    };
  }, [interact]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (mode !== 'large') return;

      // Ignore navigation if typing in an input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        if (e.key === 'Escape') {
          document.activeElement.blur();
          return; // Just blur, don't close view yet
        }
        return;
      }

      setPrevView(view);

      // Navigation Logic: Use layoutOrder.pages for horizontal navigation
      const currentPageIndex = layoutOrder.pages.indexOf(view);
      const getNextPage = (direction) => {
        const len = layoutOrder.pages.length;
        let nextIdx = currentPageIndex + direction;
        if (infiniteScroll) {
          nextIdx = (nextIdx + len) % len;
        } else {
          nextIdx = Math.max(0, Math.min(len - 1, nextIdx));
        }
        return layoutOrder.pages[nextIdx];
      };

      if (currentPageIndex !== -1) {
        if (e.key === 'ArrowLeft') setView(getNextPage(-1));
        if (e.key === 'ArrowRight') setView(getNextPage(1));

        if (view === 'home') {
          if (e.key === 'ArrowUp') setView(layoutOrder.home[0]);
          if (e.key === 'ArrowDown') setView(layoutOrder.home[1]);
        } else if (view === 'todo') {
          if (e.key === 'ArrowUp') setView(layoutOrder.todo[0] === 'calendar' ? 'todo_calendar' : 'todo_timer');
          if (e.key === 'ArrowDown') setView(layoutOrder.todo[1] === 'calendar' ? 'todo_calendar' : 'todo_timer');
        } else if (view === 'search') {
          if (e.key === 'ArrowDown') setView('search_urls');
        } else if (view === 'weather') {
          if (e.key === 'ArrowDown') setView('weather_details');
        }
      } else {
        // Handle sub-views
        if (view === 'search_urls') {
          if (e.key === 'ArrowUp') setView('search');
        } else if (view === 'weather_details') {
          if (e.key === 'ArrowUp') setView('weather');
        } else if (view === 'todo_calendar') {
          if (e.key === 'ArrowDown') setView('todo');
          if (e.key === 'Escape') setView('todo');
        } else if (view === 'todo_calendar_events') {
          if (e.key === 'ArrowDown') setView('todo_calendar');
          if (e.key === 'Escape') setView('todo_calendar');
        } else if (view === 'todo_timer') {
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') setView('todo');
        } else if (view === 'dropbox') {
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') setView('home');
        } else if (view === 'clipboard') {
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') setView('home');
        }
      }

      if (e.key === 'Escape') setView('home');
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mode, view]);

  // Transition Logic based on dynamic layoutOrder
  const getHorizontalTransform = (targetView) => {
    if (view === targetView) return 'translate(0, 0)';

    const pages = layoutOrder.pages;
    const currentIdx = pages.indexOf(view);
    const targetIdx = pages.indexOf(targetView);

    // If both are pages, calculate direction
    if (currentIdx !== -1 && targetIdx !== -1) {
      if (currentIdx < targetIdx) return 'translateX(100%)';
      return 'translateX(-100%)';
    }

    // Default behavior for views not in pages (sub-views handled specifically below)
    return 'translateX(100%)';
  };

  return (
    <div
      id="Island"
      onDragEnter={() => {
        if (showInIslandSettings) return;
        if (mode !== "large") setMode("large");
        if (view !== "dropbox") setView("dropbox");
        if (window.electronAPI) window.electronAPI.setIgnoreMouseEvents(false, false);
        setLastInteraction(Date.now());
      }}
      className={`island-container ${mode}`}
      onMouseEnter={() => {
        isMouseOver.current = true;
        if (mode !== "large") setMode("quick");
        if (window.electronAPI) {
          window.electronAPI.setIgnoreMouseEvents(false, false);
        }
        setLastInteraction(Date.now());
      }}
      onMouseLeave={() => {
        isMouseOver.current = false;
        if (isDraggingOutRef.current) return;
        if (window.electronAPI && !isMouseDown.current) {
          // Set to ignore so clicks fall through to desktop
          // forward: true ensures the window itself can still receive hover events 
          window.electronAPI.setIgnoreMouseEvents(true, true);
        }

        // Auto-collapse logic maintained
        if (view === 'dropbox' || isDraggingOutRef.current) return;

        if (standbyBorderEnabled) {
          setMode("quick");
        } else if (largeStandbyEnabled) {
          setMode("large");
        } else {
          setMode("still");
        }
      }}
      onClick={(e) => {
        if (ringingEvent) {
          e.stopPropagation();
          return;
        }
        setMode("large");
        if (window.electronAPI) {
          window.electronAPI.setIgnoreMouseEvents(false, false);
        }
      }}
      // Dropbox drop handlers removed
      style={{
        width: `${width}px`,
        height: `${height}px`,
        '--island-font-size': `${fontSize}px`,
        '--island-position': `${islandPosition}px`,
        display: "flex",
        alignItems: "center",
        opacity: hideNotActiveIslandEnabled && mode === 'still' ? 0 : opacity,
        backgroundImage: (view === 'weather' || view === 'weather_details')
          ? (getWeatherStyles().bgColor.includes('gradient') ? getWeatherStyles().bgColor : 'none')
          : `url('${bgImage}')`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
        justifyContent: "center",
        overflow: "hidden",
        fontFamily: theme === "win95" ? "w95" : "OpenRunde",
        border: theme === "win95" ? "2px solid rgb(254, 254, 254)" : islandBorderEnabled ? (alert ? `${islandBorderThickness}px ${islandBorderStyle} rgba(255, 38, 0, 0.34)` : chargingAlert ? `${islandBorderThickness}px ${islandBorderStyle} rgba(3, 196, 3, 0.301)` : hideNotActiveIslandEnabled ? "none" : `${islandBorderThickness}px ${islandBorderStyle} ${islandBorderColor}`) : "none",
        borderColor:
          theme === "win95"
            ? "#FFFFFF #808080 #808080 #FFFFFF"
            : "none",
        borderRadius:
          mode === "large" && theme === "win95"
            ? 0
            : (mode === "large" || mode === "quick")
              ? cornerRadius
              : theme === "win95"
                ? 0
                : (notchMode ? "0 0 16px 16px" : 16),
        boxShadow: hideNotActiveIslandEnabled && mode === 'still' ? "none" : '2px 2px 30px rgba(0, 0, 0, 0.07)',
        backgroundColor: (view === 'weather' || view === 'weather_details')
          ? (getWeatherStyles().bgColor.includes('gradient') ? 'transparent' : getWeatherStyles().bgColor)
          : (hideNotActiveIslandEnabled && mode === 'still' ? "rgba(0,0,0,0)" : localStorage.getItem("bg-color")),
        color: hideNotActiveIslandEnabled && mode === 'still' ? "rgba(0,0,0,0)" : localStorage.getItem("text-color"),
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        zIndex: 9999
      }}
    >
      {/* Notification View */}

      {/* Watch Live Bar (Timer/Stopwatch Running or Paused with value) */}
      {(isTimerRunning || isStopwatchRunning || timerSeconds > 0 || stopwatchSeconds > 0) && mode !== 'large' && !ringingEvent && (
        <div
          onMouseEnter={() => setIsWatchHovered(true)}
          onMouseLeave={() => setIsWatchHovered(false)}
          onClick={(e) => {
            if (!isWatchHovered) {
              setMode("large");
              if (window.electronAPI) {
                window.electronAPI.setIgnoreMouseEvents(false, false);
              }
            } else {
              // In hover mode, clicking the background (outside the pill) should expand
              // but clicking the pill itself (handled by its own z-index/stopProp) shouldn't.
              // Since the background div is the click target here:
              setMode("large");
              if (window.electronAPI) {
                window.electronAPI.setIgnoreMouseEvents(false, false);
              }
            }
          }}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isWatchHovered ? 'transparent' : (showWatchInIdle ? (localStorage.getItem("bg-color") || '#000') : 'transparent'),
            pointerEvents: 'auto',
            borderRadius: 'inherit',
            transition: 'background 0.3s ease, all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Animated Border Progress (Outer Bar - Idle) - Only for Timer */}
          {showTimerBorder && !isStopwatchRunning && !ringingEvent && (showWatchInIdle || isWatchHovered) && (
            <div 
              className="timer-progress-border"
              style={{
                position: 'absolute',
                inset: '-1px',
                borderRadius: 'inherit',
                padding: '2.5px',
                '--timer-progress': `${(timerSeconds / (timerTotalSeconds || 1)) * 100}%`,
                '--timer-border-color': timerBorderColor,
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                pointerEvents: 'none',
                opacity: !isWatchHovered ? 1 : 0,
                transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), --timer-progress 1s linear',
                zIndex: 1
              }} 
            />
          )}

          {/* Background Content when hovered */}
          <div style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 15px', pointerEvents: 'none',
            opacity: isWatchHovered ? 1 : 0,
            transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'opacity'
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: textColor }}>{time}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Cloud size={16} color={textColor} />
              <div style={{ fontSize: 16, fontWeight: 700, color: textColor }}>{weather ? `${weather}°` : "--°"}</div>
            </div>
          </div>

          {/* Main Watch Pill Content */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '200px',
              height: '32px',
              background: (localStorage.getItem("bg-color") || '#000'),
              borderRadius: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 12px',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s ease',
              boxShadow: isWatchHovered ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
              border: isWatchHovered ? '1px solid rgba(255,255,255,0.1)' : 'none',
              position: 'relative',
              zIndex: 2,
              opacity: (showWatchInIdle || isWatchHovered) ? 1 : 0,
              pointerEvents: (showWatchInIdle || isWatchHovered) ? 'auto' : 'none',
              transform: (showWatchInIdle || isWatchHovered) ? 'scale(1)' : 'scale(0.9)'
            }}>
            {/* Animated Border Progress (Inner Pill - Hover) - Only for Timer */}
            {showTimerBorder && !isStopwatchRunning && !ringingEvent && (
              <div 
                className="timer-progress-border"
                style={{
                  position: 'absolute',
                  inset: '-1px',
                  borderRadius: 'inherit',
                  padding: '2.5px',
                  '--timer-progress': `${(timerSeconds / (timerTotalSeconds || 1)) * 100}%`,
                  '--timer-border-color': timerBorderColor,
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                  pointerEvents: 'none',
                  opacity: isWatchHovered ? 1 : 0,
                  transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), --timer-progress 1s linear',
                  zIndex: 1
                }} 
              />
            )}
            {/* Left: Time */}
            <div style={{
              fontSize: 13,
              fontWeight: 700,
              color: textColor,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: -0.5
            }}>
              {(isTimerRunning || (timerSeconds > 0 && !isStopwatchRunning)) ? formatTimer(timerSeconds) : formatTimer(stopwatchSeconds)}
            </div>

            {/* Right: Icon or Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isWatchHovered ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, animation: 'fadeIn 0.2s ease-out' }}>
                  <div
                    onClick={() => {
                      if (isTimerRunning || (timerSeconds > 0 && !isStopwatchRunning)) {
                        setIsTimerRunning(!isTimerRunning);
                      } else {
                        setIsStopwatchRunning(!isStopwatchRunning);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {(isTimerRunning || isStopwatchRunning)
                      ? <Pause size={14} color={textColor} />
                      : <Play size={14} color={textColor} />}
                  </div>
                  <div
                    onClick={() => {
                      setIsTimerRunning(false);
                      setIsStopwatchRunning(false);
                      setTimerSeconds(0);
                      setStopwatchSeconds(0);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <X size={14} color="#ef4444" />
                  </div>
                </div>
              ) : (
                <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
                  {isStopwatchRunning && <TimerIcon size={16} color={textColor} />}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {ringingEvent && (
        <div style={{
          position: 'absolute',
          inset: mode === 'large' ? '12px auto auto 15px' : 0,
          width: mode === 'large' ? 'auto' : '100%',
          height: mode === 'large' ? '32px' : '100%',
          maxWidth: mode === 'large' ? '220px' : 'none',
          zIndex: 250,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'auto',
          background: mode === 'large' ? 'transparent' : (view === 'weather' || view === 'weather_details')
            ? (getWeatherStyles().bgColor.includes('gradient') ? getWeatherStyles().bgColor : localStorage.getItem("bg-color") || '#000')
            : (localStorage.getItem("bg-color") || '#000'),
          borderRadius: mode === 'large' ? '20px' : 'inherit',
        }}
        >
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: 'inherit',
            background: `linear-gradient(90deg, transparent, ${textColor}88, ${textColor}, ${textColor}88, transparent)`,
            backgroundSize: '200% 100%',
            animation: 'gradientMove 2.5s ease-in-out infinite',
            padding: mode === 'large' ? '1.5px' : '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <style>{`
              @keyframes gradientMove {
                0% { background-position: -100% 50%; }
                100% { background-position: 100% 50%; }
              }
            `}</style>
            <div
              onMouseEnter={() => setIsRingerHovered(true)}
              onMouseLeave={() => setIsRingerHovered(false)}
              onClick={() => {
                stopRingingNow({ isoDate: ringingEvent.isoDate, eventId: ringingEvent.id, navigate: false });
              }}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 'inherit',
                background: localStorage.getItem("bg-color") || '#000',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: mode === 'large' ? '0 12px' : '0 15px',
                cursor: 'pointer',
                gap: 8
              }}
            >
              {/* Left: Current Time (Clock) or Time icon */}
              <div style={{ fontSize: mode === 'large' ? 12 : 16, fontWeight: 700, color: textColor, whiteSpace: 'nowrap' }}>
                {mode === 'large' ? (ringingEvent.time || '--:--') : time}
              </div>

              {/* Center: Event Text */}
              <div style={{
                fontSize: mode === 'large' ? 11 : 13,
                fontWeight: 600,
                opacity: 0.9,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                color: textColor,
                textAlign: 'center'
              }}>
                {ringingEvent.text}
              </div>

              {/* Right: Spacer to maintain centering */}
              {mode !== 'large' && (
                <div style={{ width: 40 }} />
              )}
            </div>
          </div>
        </div>
      )}
      {/*Quickview*/}
      {(mode === "quick" || (mode === "still" && isPlaying)) && !ringingEvent && !(isTimerRunning || isStopwatchRunning || timerSeconds > 0 || stopwatchSeconds > 0) ? (
        <>
          {isPlaying && !alert && !chargingAlert ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              opacity: hideNotActiveIslandEnabled ? .6 : 1,
              padding: '0 10px',
              height: '100%',
              overflow: 'hidden'
            }}>
              {/* Left: Vinyl Only */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Rotating Vinyl */}
                <div style={{ position: 'relative', width: 28, height: 28, flexShrink: 0 }}>
                  <div style={{
                    width: '100%', height: '100%', borderRadius: '50%',
                    backgroundImage: `url(${spotifyTrack?.artwork_url || ''})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    animation: 'spin 4s linear infinite',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backgroundColor: '#111'
                  }}>
                    {!spotifyTrack?.artwork_url && (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🎵</div>
                    )}
                  </div>
                  <style>{`
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                  `}</style>
                </div>
              </div>

              {/* Right: Empty spacer */}
              <div style={{ marginLeft: 'auto' }}></div>
            </div>
          ) : (
            <>
              <h1
                className="text"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "15px",
                  transform: "translateY(-50%)",
                  fontSize: 16,
                  fontWeight: 600,
                  margin: 0,
                  animation: 'appear .3s ease-out',
                  color: chargingAlert === true && !alert ? "#6fff7bff" : localStorage.getItem("text-color")
                }}
              >
                {alert === true ? <img src={lowBatteryIcon} alt="low battery" style={{ width: 40, height: 40, objectFit: 'contain', position: 'absolute', transform: 'translate(0%, -50%)' }} /> : chargingAlert ? <img src={chargingIcon} alt="charging" style={{ width: 40, height: 40, objectFit: 'contain', position: 'absolute', transform: 'translate(0%, -50%)' }} /> : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{time}</span>
                  </div>
                )}
              </h1>
              <h1
                className="text"
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "15px",
                  transform: "translateY(-50%)",
                  fontSize: 16,
                  fontWeight: 600,
                  margin: 0,
                  animation: 'appear .3s ease-out',
                  color: alert === true
                    ? "#ff3f3fff"
                    : `${localStorage.getItem("text-color")} `
                }}
              >
                {alert === true ? `${percent}% ` : chargingAlert === true ? `${percent}% ` : standbyBorderEnabled ? "" : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Cloud size={16} color={textColor} />
                    <span>{weather ? `${weather} º` : ""}</span>
                  </div>
                )}
              </h1>
            </>
          )}
        </>
      ) : null}

      {/* Scroll Overlay */}
      {showScrollOverlay && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          zIndex: 200, display: 'flex', alignItems: 'center', gap: 10,
          pointerEvents: 'none', transition: 'opacity 0.2s ease',
          opacity: showScrollOverlay ? 1 : 0
        }}>
          {scrollAction === 'volume' ? (
            (scrollValue === 0) ? (VolumeX ? <VolumeX size={16} color={textColor} /> : <span>M</span>) : (Volume2 ? <Volume2 size={16} color={textColor} /> : <span>V</span>)
          ) : (
            Sun ? <Sun size={16} color={textColor} /> : <span>B</span>
          )}
          <div style={{ width: 60, height: 4, background: `${textColor}33`, borderRadius: 2 }}>
            <div style={{ width: `${Math.max(0, Math.min(100, scrollValue))}%`, height: '100%', background: textColor, borderRadius: 2, transition: 'width 0.1s ease' }} />
          </div>
        </div>
      )}

      {/* Navigation Areas - Destination Icons Only */}
      {mode === 'large' && showArrows && !showInIslandSettings && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, pointerEvents: 'none' }}>
          {/* Left Side */}
          {layoutOrder.pages.includes(view) && (
            <div
              className="nav-dest-zone left"
              onClick={() => {
                const len = layoutOrder.pages.length;
                const currentIdx = layoutOrder.pages.indexOf(view);
                let nextIdx = currentIdx - 1;
                if (infiniteScroll) {
                  nextIdx = (nextIdx + len) % len;
                } else {
                  if (nextIdx < 0) return;
                }
                setPrevView(view);
                setView(layoutOrder.pages[nextIdx]);
              }}
              onMouseEnter={() => setHoveredNav('left')}
              onMouseLeave={() => setHoveredNav(null)}
              style={{
                position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                width: '40px', height: '60px', pointerEvents: 'auto', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: hoveredNav === 'left' ? 0.6 : 0, transition: 'opacity 0.2s ease'
              }}>
              {(() => {
                const len = layoutOrder.pages.length;
                const currentIdx = layoutOrder.pages.indexOf(view);
                let nextIdx = currentIdx - 1;
                if (infiniteScroll) nextIdx = (nextIdx + len) % len;
                if (nextIdx >= 0 && nextIdx < len) {
                  const nextView = layoutOrder.pages[nextIdx];
                  switch (nextView) {
                    case 'home': return <Home size={14} color={textColor} />;
                    case 'search': return <Search size={14} color={textColor} />;
                    case 'weather': return <Cloud size={14} color={textColor} />;
                    case 'music': return <Music size={14} color={textColor} />;
                    case 'ai': return <MessageSquare size={14} color={textColor} />;
                    case 'todo': return <List size={14} color={textColor} />;
                    case 'app_shortcuts': return <LayoutGrid size={14} color={textColor} />;
                    default: return <ChevronLeft size={14} color={textColor} />;
                  }
                }
                return null;
              })()}
            </div>
          )}
          {/* Right Side */}
          {layoutOrder.pages.includes(view) && (
            <div
              className="nav-dest-zone right"
              onClick={() => {
                const len = layoutOrder.pages.length;
                const currentIdx = layoutOrder.pages.indexOf(view);
                let nextIdx = currentIdx + 1;
                if (infiniteScroll) {
                  nextIdx = nextIdx % len;
                } else {
                  if (nextIdx >= len) return;
                }
                setPrevView(view);
                setView(layoutOrder.pages[nextIdx]);
              }}
              onMouseEnter={() => setHoveredNav('right')}
              onMouseLeave={() => setHoveredNav(null)}
              style={{
                position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                width: '40px', height: '60px', pointerEvents: 'auto', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: hoveredNav === 'right' ? 0.6 : 0, transition: 'opacity 0.2s ease'
              }}>
              {(() => {
                const len = layoutOrder.pages.length;
                const currentIdx = layoutOrder.pages.indexOf(view);
                let nextIdx = currentIdx + 1;
                if (infiniteScroll) nextIdx = nextIdx % len;
                if (nextIdx >= 0 && nextIdx < len) {
                  const nextView = layoutOrder.pages[nextIdx];
                  switch (nextView) {
                    case 'home': return <Home size={14} color={textColor} />;
                    case 'search': return <Search size={14} color={textColor} />;
                    case 'weather': return <Cloud size={14} color={textColor} />;
                    case 'music': return <Music size={14} color={textColor} />;
                    case 'ai': return <MessageSquare size={14} color={textColor} />;
                    case 'todo': return <List size={14} color={textColor} />;
                    case 'app_shortcuts': return <LayoutGrid size={14} color={textColor} />;
                    default: return <ChevronRight size={14} color={textColor} />;
                  }
                }
                return null;
              })()}
            </div>
          )}
          {/* Bottom Area (Home -> Dropbox, or Expand for Weather/Todo/Search) */}
          {((view === 'home') || (view === 'weather') || (view === 'todo') || (view === 'search') || (view === 'weather_details') || (view === 'todo_timer') || (view === 'search_urls') || (view === 'todo_calendar')) && (
            <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 20 }}>
              <div
                className="nav-dest-zone bottom-action"
                onClick={() => {
                  if (view === 'home') {
                    setPrevView(view);
                    setView(layoutOrder.home[1]);
                  } else if (view === 'weather') {
                    setPrevView(view);
                    setView(layoutOrder.weather[1] === 'details' ? 'weather_details' : 'weather');
                  } else if (view === 'todo') {
                    setPrevView(view);
                    setView(layoutOrder.todo[1] === 'calendar' ? 'todo_calendar' : 'todo_timer');
                  } else if (view === 'search') {
                    setPrevView(view);
                    setView(layoutOrder.search[1] === 'urls' ? 'search_urls' : 'search');
                  } else if (view === 'weather_details') {
                    setPrevView(view);
                    setView('weather');
                  } else if (view === 'todo_timer' || view === 'todo_calendar') {
                    setPrevView(view);
                    setView('todo');
                  } else if (view === 'search_urls') {
                    setPrevView(view);
                    setView('search');
                  }
                }}
                onMouseEnter={() => setHoveredNav('bottom-action')}
                onMouseLeave={() => setHoveredNav(null)}
                style={{
                  width: '40px', height: '30px', pointerEvents: 'auto', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: hoveredNav === 'bottom-action' ? 0.6 : 0, transition: 'opacity 0.2s ease'
                }}>
                {(view === 'home') && (layoutOrder.home[1] === 'dropbox' ? <Box size={14} color={textColor} /> : <ClipboardIcon size={14} color={textColor} />)}
                {(view === 'weather' || view === 'todo' || view === 'search') && <ChevronDown size={14} color={textColor} />}
                {(view === 'weather_details' || view === 'todo_timer' || view === 'search_urls' || view === 'todo_calendar') && <ChevronUp size={14} color={textColor} />}
              </div>
            </div>
          )}
          {/* Top Area (Home -> Clipboard, or Return from Sub-views) */}
          {((view === 'home') || (view === 'todo') || (view === 'weather') || (view === 'search') || (view === 'weather_details') || (view === 'todo_timer') || (view === 'search_urls') || (view === 'dropbox') || (view === 'todo_calendar')) && (
            <div
              className={`nav-dest-zone ${view === 'home' || view === 'todo' || view === 'weather' || view === 'search' ? 'top-clipboard' : 'top-return'}`}
              onClick={() => {
                setPrevView(view);
                if (view === 'home') setView(layoutOrder.home[0]);
                else if (view === 'todo') setView(layoutOrder.todo[0] === 'calendar' ? 'todo_calendar' : 'todo_timer');
                else if (view === 'weather') setView(layoutOrder.weather[0] === 'details' ? 'weather_details' : 'weather');
                else if (view === 'search') setView(layoutOrder.search[0] === 'urls' ? 'search_urls' : 'search');
                else if (view === 'weather_details') setView('weather');
                else if (view === 'todo_timer' || view === 'todo_calendar') setView('todo');
                else if (view === 'search_urls') setView('search');
                else if (view === 'dropbox') setView('home');
              }}
              onMouseEnter={() => setHoveredNav('top-area')}
              onMouseLeave={() => setHoveredNav(null)}
              style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: '60px', height: '30px', pointerEvents: 'auto', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: hoveredNav === 'top-area' ? 0.8 : ((view === 'home' || view === 'todo') ? 0 : 0.3),
                transition: 'opacity 0.2s ease'
              }}>
              {view === 'home' ? (layoutOrder.home[0] === 'dropbox' ? <Box size={14} color={textColor} /> : <ClipboardIcon size={14} color={textColor} />) :
                view === 'todo' ? (layoutOrder.todo[0] === 'calendar' ? <Calendar size={14} color={textColor} /> : <TimerIcon size={14} color={textColor} />) :
                  view === 'weather' ? (layoutOrder.weather[0] === 'details' ? <Cloud size={14} color={textColor} /> : <Cloud size={14} color={textColor} />) :
                    view === 'search' ? (layoutOrder.search[0] === 'urls' ? <Search size={14} color={textColor} /> : <Search size={14} color={textColor} />) :
                      <ChevronUp size={16} color={textColor} />}
            </div>
          )}
          {/* Return Areas (Bottom) */}
          {view === 'clipboard' && (
            <div
              className="nav-dest-zone bottom"
              onClick={() => {
                setPrevView(view);
                setView('home');
              }}
              onMouseEnter={() => setHoveredNav('bottom')}
              onMouseLeave={() => setHoveredNav(null)}
              style={{
                position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                width: '60px', height: '30px', pointerEvents: 'auto', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: hoveredNav === 'bottom' ? 0.6 : 0, transition: 'opacity 0.2s ease'
              }}>
              <Home size={14} color={textColor} />
            </div>
          )}
        </div>
      )}

      {/* Persistent Clock and Battery Status (Top-Right on non-home views) */}
      {view !== 'dropbox' && !showInIslandSettings && (
        <div style={{
          position: 'absolute', top: 15, right: 25, zIndex: 100,
          display: 'flex', alignItems: 'center', gap: 12,
          opacity: (mode === 'large') ? 1 : 0,
          transition: 'all 0.5s ease',
          pointerEvents: 'none'
        }}>
          {(view !== 'home') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, pointerEvents: 'auto' }}>
              <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.9 }}>{percent}%</span>
              <div style={{ width: 22, height: 12, position: 'relative' }}>
                {charging ? (
                  <img src={chargingIcon} alt="Charging" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : percent <= 20 ? (
                  <img src={lowBatteryIcon} alt="Low Battery" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <div style={{
                    width: '100%', height: '100%', border: `1.5px solid ${textColor}`,
                    borderRadius: 2.5, padding: 1, position: 'relative'
                  }}>
                    <div style={{
                      width: `${percent}%`, height: '100%', background: percent <= 20 ? '#ef4444' : percent <= 60 ? '#fbbf24' : '#4ade80',
                      borderRadius: 1
                    }} />
                    <div style={{
                      position: 'absolute', right: -3, top: '50%', transform: 'translateY(-50%)',
                      width: 2, height: 4, background: textColor, borderRadius: '0 1px 1px 0'
                    }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transitioning Clock: Only show here if NOT home (now on the right) */}
          <div style={{
            opacity: view !== 'home' ? 1 : 0,
            transform: view !== 'home' ? 'translateX(0)' : 'translateX(20px)',
            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            textAlign: 'right',
            fontFamily: clockFont === 'w95' ? '"MS Sans Serif", "Microsoft Sans Serif", sans-serif' :
              clockFont === 'OpenRunde' ? '"OpenRunde", sans-serif' :
                clockFont
          }}>
            {clockStyle === 'analog' ? (
              <AnalogClock size={20} color={textColor} style={analogStyle} />
            ) : (
              <h1 style={{ fontSize: 12, margin: 0, lineHeight: 1, fontWeight: 600 }}>{time}</h1>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area with Transitions */}
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>

        {/* Home View */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          opacity: view === 'home' && mode === 'large' ? 1 : 0,
          transform: view === layoutOrder.home[0] ? 'translateY(100%)' :
            view === layoutOrder.home[1] ? 'translateY(-100%)' :
              getHorizontalTransform('home'),
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: view === 'home' && mode === 'large' ? 'auto' : 'none',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>

          <div
            onClick={() => setShowInIslandSettings(true)}
            style={{
              position: 'absolute',
              right: 12,
              bottom: 10,
              cursor: 'pointer',
              opacity: 0.25,
              transition: 'opacity 0.2s ease',
              zIndex: 101
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.25'}
          >
            <Settings size={12} color={textColor} />
            {updateDownloaded && (
              <div style={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 6,
                height: 6,
                background: '#ef4444',
                borderRadius: '50%',
                border: `1px solid ${localStorage.getItem("bg-color") || '#000'}`,
                boxShadow: '0 0 5px rgba(239, 68, 68, 0.5)'
              }} />
            )}
          </div>

          {showInIslandSettings && (
            <div
              ref={settingsRef}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.9)',
                zIndex: 200,
                padding: '40px 20px 20px 20px',
                display: 'flex',
                flexDirection: 'column',
                backdropFilter: 'blur(20px)',
                animation: 'appear 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}>
              <div style={{
                position: 'absolute',
                top: 15,
                left: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <Settings size={14} color={textColor} opacity={0.6} />
                <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.4, letterSpacing: 1.5 }}>SETTINGS</div>
              </div>

              <div
                onClick={() => setShowInIslandSettings(false)}
                style={{
                  position: 'absolute',
                  top: 15,
                  right: 20,
                  cursor: 'pointer',
                  opacity: 0.5
                }}
              >
                <X size={16} color={textColor} />
              </div>

              <div style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                paddingRight: 5
              }}>
                {/* Clock Customization Section */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.3, marginBottom: 10, textTransform: 'uppercase' }}>Clock Customization</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Clock Style */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>Clock Style</span>
                      <div style={{ display: 'flex', gap: 5, background: 'rgba(255,255,255,0.05)', padding: 3, borderRadius: 8 }}>
                        {['digital', 'analog'].map(style => (
                          <div
                            key={style}
                            onClick={() => {
                              setClockStyle(style);
                              localStorage.setItem("clock-style", style);
                            }}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer',
                              background: clockStyle === style ? 'rgba(255,255,255,0.1)' : 'transparent',
                              color: clockStyle === style ? '#fff' : 'rgba(255,255,255,0.4)',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {style.toUpperCase()}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Clock Font */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>Clock Font</span>
                      <div style={{ position: 'relative' }}>
                        <select
                          value={clockFont}
                          onChange={(e) => {
                            setClockFont(e.target.value);
                            localStorage.setItem("clock-font", e.target.value);
                          }}
                          style={{
                            appearance: 'none',
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white',
                            padding: '6px 28px 6px 12px',
                            borderRadius: 10,
                            fontSize: 12,
                            fontWeight: 500,
                            outline: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            minWidth: '130px'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(255,255,255,0.12)';
                            e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(255,255,255,0.08)';
                            e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                          }}
                        >
                          <option value="OpenRunde" style={{ background: '#1a1a1a' }}>OpenRunde</option>
                          <option value="w95" style={{ background: '#1a1a1a' }}>Win95 (Original)</option>
                          <option value="SF Pro Display" style={{ background: '#1a1a1a' }}>SF Pro</option>
                          <option value="Segoe UI" style={{ background: '#1a1a1a' }}>Segoe UI</option>
                          <option value="monospace" style={{ background: '#1a1a1a' }}>Monospace</option>
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} />
                      </div>
                    </div>

                    {/* Analog Style */}
                    {clockStyle === 'analog' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>Analog Style</span>
                        <div style={{ position: 'relative' }}>
                          <select
                            value={analogStyle}
                            onChange={(e) => {
                              setAnalogStyle(e.target.value);
                              localStorage.setItem("analog-style", e.target.value);
                            }}
                            style={{
                              appearance: 'none',
                              background: 'rgba(255,255,255,0.08)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              color: 'white',
                              padding: '6px 28px 6px 12px',
                              borderRadius: 10,
                              fontSize: 12,
                              fontWeight: 500,
                              outline: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              minWidth: '130px'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'rgba(255,255,255,0.12)';
                              e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'rgba(255,255,255,0.08)';
                              e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                            }}
                          >
                            <option value="simple" style={{ background: '#1a1a1a' }}>Simple</option>
                            <option value="cyber" style={{ background: '#1a1a1a' }}>Cyber</option>
                            <option value="minimalist" style={{ background: '#1a1a1a' }}>Minimalist</option>
                            <option value="cool" style={{ background: '#1a1a1a' }}>Cool</option>
                            <option value="retro" style={{ background: '#1a1a1a' }}>Retro</option>
                            <option value="modern" style={{ background: '#1a1a1a' }}>Modern</option>
                          </select>
                          <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} />
                        </div>
                      </div>
                    )}

                    {/* Timer Border Color */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>Timer Border Color</span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          type="color"
                          value={timerBorderColor}
                          onChange={(e) => {
                            setTimerBorderColor(e.target.value);
                            localStorage.setItem("timer-border-color", e.target.value);
                          }}
                          style={{
                            width: 24,
                            height: 24,
                            padding: 0,
                            border: 'none',
                            borderRadius: 4,
                            background: 'none',
                            cursor: 'pointer'
                          }}
                        />
                        <input
                          type="text"
                          value={timerBorderColor}
                          onChange={(e) => {
                            setTimerBorderColor(e.target.value);
                            localStorage.setItem("timer-border-color", e.target.value);
                          }}
                          style={{
                            width: 70,
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: 8,
                            fontSize: 11,
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Layout Customization Section */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.3, marginBottom: 10, textTransform: 'uppercase' }}>Layout & Reordering</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>

                    {/* Page Reordering */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div
                        onClick={() => setExpandedSections(prev => ({ ...prev, pages: !prev.pages }))}
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          opacity: 0.7,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                      >
                        {expandedSections.pages ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        Page Visibility & Order
                      </div>
                      {expandedSections.pages && (
                        <div style={{ display: 'flex', gap: 15, width: '100%' }}>
                          {/* Active Pages */}
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ fontSize: 10, opacity: 0.5, fontWeight: 600 }}>ACTIVE</div>
                            <div
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                const pageName = e.dataTransfer.getData("pageName");
                                const fromType = e.dataTransfer.getData("fromType");
                                if (fromType === "hidden") {
                                  const newHidden = layoutOrder.hiddenPages.filter(p => p !== pageName);
                                  const newPages = [...layoutOrder.pages, pageName];
                                  const updated = { ...layoutOrder, pages: newPages, hiddenPages: newHidden };
                                  setLayoutOrder(updated);
                                  localStorage.setItem("island-layout-order", JSON.stringify(updated));
                                }
                              }}
                              style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 8,
                                background: 'rgba(255,255,255,0.03)',
                                padding: 10,
                                borderRadius: 12,
                                border: '1px solid rgba(255,255,255,0.05)',
                                minHeight: '60px'
                              }}>
                              {layoutOrder.pages.map((page, idx) => (
                                <div
                                  key={page}
                                  draggable
                                  onDragStart={(e) => {
                                    e.dataTransfer.setData("pageName", page);
                                    e.dataTransfer.setData("pageIdx", idx);
                                    e.dataTransfer.setData("fromType", "active");
                                  }}
                                  onDragOver={(e) => e.preventDefault()}
                                  onDrop={(e) => {
                                    e.stopPropagation();
                                    const fromIdx = e.dataTransfer.getData("pageIdx");
                                    const fromType = e.dataTransfer.getData("fromType");
                                    const pageName = e.dataTransfer.getData("pageName");

                                    if (fromType === "active") {
                                      const newPages = [...layoutOrder.pages];
                                      const [moved] = newPages.splice(parseInt(fromIdx), 1);
                                      newPages.splice(idx, 0, moved);
                                      const updated = { ...layoutOrder, pages: newPages };
                                      setLayoutOrder(updated);
                                      localStorage.setItem("island-layout-order", JSON.stringify(updated));
                                    } else {
                                      const newHidden = layoutOrder.hiddenPages.filter(p => p !== pageName);
                                      const newPages = [...layoutOrder.pages];
                                      newPages.splice(idx, 0, pageName);
                                      const updated = { ...layoutOrder, pages: newPages, hiddenPages: newHidden };
                                      setLayoutOrder(updated);
                                      localStorage.setItem("island-layout-order", JSON.stringify(updated));
                                    }
                                  }}
                                  style={{
                                    padding: '6px 10px',
                                    background: 'rgba(255,255,255,0.08)',
                                    borderRadius: 8,
                                    fontSize: 11,
                                    cursor: 'grab',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    userSelect: 'none'
                                  }}
                                >
                                  <GripVertical size={10} style={{ opacity: 0.4 }} />
                                  {page === 'app_shortcuts' ? 'App Shortcuts' : page.charAt(0).toUpperCase() + page.slice(1)}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Hidden Pages */}
                          <div style={{ width: '120px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ fontSize: 10, opacity: 0.5, fontWeight: 600 }}>HIDDEN</div>
                            <div
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                const pageName = e.dataTransfer.getData("pageName");
                                const fromType = e.dataTransfer.getData("fromType");
                                if (fromType === "active") {
                                  // Don't allow hiding 'home' if it's the only page
                                  if (layoutOrder.pages.length <= 1) return;

                                  const newPages = layoutOrder.pages.filter(p => p !== pageName);
                                  const newHidden = [...layoutOrder.hiddenPages, pageName];
                                  const updated = { ...layoutOrder, pages: newPages, hiddenPages: newHidden };
                                  setLayoutOrder(updated);
                                  localStorage.setItem("island-layout-order", JSON.stringify(updated));

                                  // If hiding current view, go back to home
                                  if (view === pageName) setView('home');
                                }
                              }}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 6,
                                background: 'rgba(255,255,255,0.02)',
                                padding: 8,
                                borderRadius: 12,
                                border: '1px dashed rgba(255,255,255,0.1)',
                                minHeight: '60px'
                              }}>
                              {layoutOrder.hiddenPages.map((page, idx) => (
                                <div
                                  key={page}
                                  draggable
                                  onDragStart={(e) => {
                                    e.dataTransfer.setData("pageName", page);
                                    e.dataTransfer.setData("pageIdx", idx);
                                    e.dataTransfer.setData("fromType", "hidden");
                                  }}
                                  style={{
                                    padding: '4px 8px',
                                    background: 'rgba(255,255,255,0.04)',
                                    borderRadius: 6,
                                    fontSize: 10,
                                    cursor: 'grab',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    opacity: 0.6,
                                    userSelect: 'none'
                                  }}
                                >
                                  <GripVertical size={8} style={{ opacity: 0.3 }} />
                                  {page === 'app_shortcuts' ? 'App Shortcuts' : page.charAt(0).toUpperCase() + page.slice(1)}
                                </div>
                              ))}
                              {layoutOrder.hiddenPages.length === 0 && (
                                <div style={{ fontSize: 9, opacity: 0.2, textAlign: 'center', padding: '10px 0' }}>Drag here to hide</div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Home Layout */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div
                        onClick={() => setExpandedSections(prev => ({ ...prev, home: !prev.home }))}
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          opacity: 0.7,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                      >
                        {expandedSections.home ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        Home Tiles (Top / Bottom)
                      </div>
                      {expandedSections.home && (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                          background: 'rgba(255,255,255,0.03)',
                          padding: 10,
                          borderRadius: 12,
                          border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                          {layoutOrder.home.map((tile, idx) => (
                            <div
                              key={tile}
                              draggable
                              onDragStart={(e) => e.dataTransfer.setData("homeIdx", idx)}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                const fromIdx = parseInt(e.dataTransfer.getData("homeIdx"));
                                const newHome = [...layoutOrder.home];
                                const [moved] = newHome.splice(fromIdx, 1);
                                newHome.splice(idx, 0, moved);
                                const updated = { ...layoutOrder, home: newHome };
                                setLayoutOrder(updated);
                                localStorage.setItem("island-layout-order", JSON.stringify(updated));
                              }}
                              style={{
                                padding: '8px 12px',
                                background: 'rgba(255,255,255,0.08)',
                                borderRadius: 10,
                                fontSize: 11,
                                cursor: 'grab',
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                userSelect: 'none'
                              }}
                            >
                              <GripVertical size={12} style={{ opacity: 0.4 }} />
                              <span style={{ opacity: 0.5, fontSize: 10, width: 45 }}>{idx === 0 ? "TOP" : "BOTTOM"}</span>
                              {tile === 'dropbox' ? 'Dropbox' : 'Clipboard'}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Weather Layout */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div
                        onClick={() => setExpandedSections(prev => ({ ...prev, weather: !prev.weather }))}
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          opacity: 0.7,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                      >
                        {expandedSections.weather ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        Weather Tiles (Top / Bottom)
                      </div>
                      {expandedSections.weather && (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                          background: 'rgba(255,255,255,0.03)',
                          padding: 10,
                          borderRadius: 12,
                          border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                          {layoutOrder.weather.map((tile, idx) => (
                            <div
                              key={tile}
                              draggable
                              onDragStart={(e) => e.dataTransfer.setData("weatherIdx", idx)}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                const fromIdx = parseInt(e.dataTransfer.getData("weatherIdx"));
                                const newWeather = [...layoutOrder.weather];
                                const [moved] = newWeather.splice(fromIdx, 1);
                                newWeather.splice(idx, 0, moved);
                                const updated = { ...layoutOrder, weather: newWeather };
                                setLayoutOrder(updated);
                                localStorage.setItem("island-layout-order", JSON.stringify(updated));
                              }}
                              style={{
                                padding: '8px 12px',
                                background: 'rgba(255,255,255,0.08)',
                                borderRadius: 10,
                                fontSize: 11,
                                cursor: 'grab',
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                userSelect: 'none'
                              }}
                            >
                              <GripVertical size={12} style={{ opacity: 0.4 }} />
                              <span style={{ opacity: 0.5, fontSize: 10, width: 45 }}>{idx === 0 ? "TOP" : "BOTTOM"}</span>
                              {tile === 'details' ? 'Weather Details' : 'Weather Main'}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Search Layout */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div
                        onClick={() => setExpandedSections(prev => ({ ...prev, search: !prev.search }))}
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          opacity: 0.7,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                      >
                        {expandedSections.search ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        Search Tiles (Top / Bottom)
                      </div>
                      {expandedSections.search && (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                          background: 'rgba(255,255,255,0.03)',
                          padding: 10,
                          borderRadius: 12,
                          border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                          {layoutOrder.search.map((tile, idx) => (
                            <div
                              key={tile}
                              draggable
                              onDragStart={(e) => e.dataTransfer.setData("searchIdx", idx)}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                const fromIdx = parseInt(e.dataTransfer.getData("searchIdx"));
                                const newSearch = [...layoutOrder.search];
                                const [moved] = newSearch.splice(fromIdx, 1);
                                newSearch.splice(idx, 0, moved);
                                const updated = { ...layoutOrder, search: newSearch };
                                setLayoutOrder(updated);
                                localStorage.setItem("island-layout-order", JSON.stringify(updated));
                              }}
                              style={{
                                padding: '8px 12px',
                                background: 'rgba(255,255,255,0.08)',
                                borderRadius: 10,
                                fontSize: 11,
                                cursor: 'grab',
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                userSelect: 'none'
                              }}
                            >
                              <GripVertical size={12} style={{ opacity: 0.4 }} />
                              <span style={{ opacity: 0.5, fontSize: 10, width: 45 }}>{idx === 0 ? "TOP" : "BOTTOM"}</span>
                              {tile === 'urls' ? 'Quick URLs' : 'Search Input'}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Todo Layout */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div
                        onClick={() => setExpandedSections(prev => ({ ...prev, todo: !prev.todo }))}
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          opacity: 0.7,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                      >
                        {expandedSections.todo ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        Todo Tiles (Top / Bottom)
                      </div>
                      {expandedSections.todo && (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                          background: 'rgba(255,255,255,0.03)',
                          padding: 10,
                          borderRadius: 12,
                          border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                          {layoutOrder.todo.map((tile, idx) => (
                            <div
                              key={tile}
                              draggable
                              onDragStart={(e) => e.dataTransfer.setData("todoIdx", idx)}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                const fromIdx = parseInt(e.dataTransfer.getData("todoIdx"));
                                const newTodo = [...layoutOrder.todo];
                                const [moved] = newTodo.splice(fromIdx, 1);
                                newTodo.splice(idx, 0, moved);
                                const updated = { ...layoutOrder, todo: newTodo };
                                setLayoutOrder(updated);
                                localStorage.setItem("island-layout-order", JSON.stringify(updated));
                              }}
                              style={{
                                padding: '8px 12px',
                                background: 'rgba(255,255,255,0.08)',
                                borderRadius: 10,
                                fontSize: 11,
                                cursor: 'grab',
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                userSelect: 'none'
                              }}
                            >
                              <GripVertical size={12} style={{ opacity: 0.4 }} />
                              <span style={{ opacity: 0.5, fontSize: 10, width: 45 }}>{idx === 0 ? "TOP" : "BOTTOM"}</span>
                              {tile === 'calendar' ? 'Calendar' : 'Timer'}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Visibility Toggles Section */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.3, marginBottom: 10, textTransform: 'uppercase' }}>Visibility</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Show Watch in Idle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>Show Watch in Idle</span>
                      <div
                        onClick={() => {
                          const newVal = !showWatchInIdle;
                          setShowWatchInIdle(newVal);
                          localStorage.setItem("show-watch-idle", String(newVal));
                        }}
                        style={{
                          width: 34,
                          height: 20,
                          borderRadius: 10,
                          background: showWatchInIdle ? '#4facfe' : 'rgba(255,255,255,0.1)',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: 'white',
                          position: 'absolute',
                          top: 2,
                          left: showWatchInIdle ? 16 : 2,
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                        }} />
                      </div>
                    </div>

                    {/* Show Timer Border */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>Timer Progress Border</span>
                      <div
                        onClick={() => {
                          const newVal = !showTimerBorder;
                          setShowTimerBorder(newVal);
                          localStorage.setItem("show-timer-border", String(newVal));
                        }}
                        style={{
                          width: 34,
                          height: 20,
                          borderRadius: 10,
                          background: showTimerBorder ? '#4facfe' : 'rgba(255,255,255,0.1)',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: 'white',
                          position: 'absolute',
                          top: 2,
                          left: showTimerBorder ? 16 : 2,
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                        }} />
                      </div>
                    </div>


                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>Notifications</span>
                      <div
                        onClick={() => {
                          const newVal = !notificationsEnabled;
                          setNotificationsEnabled(newVal);
                          localStorage.setItem("notifications-enabled", String(newVal));
                        }}
                        style={{
                          width: 34,
                          height: 20,
                          borderRadius: 10,
                          background: notificationsEnabled ? '#4facfe' : 'rgba(255,255,255,0.1)',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: 'white',
                          position: 'absolute',
                          top: 2,
                          left: notificationsEnabled ? 16 : 2,
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                        }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>Notch Mode</span>
                      <div
                        onClick={() => {
                          const newVal = !notchMode;
                          setNotchMode(newVal);
                          localStorage.setItem("notch-mode", String(newVal));
                        }}
                        style={{
                          width: 34,
                          height: 20,
                          borderRadius: 10,
                          background: notchMode ? '#4facfe' : 'rgba(255,255,255,0.1)',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: 'white',
                          position: 'absolute',
                          top: 2,
                          left: notchMode ? 16 : 2,
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                        }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* General Settings Section */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.3, marginBottom: 10, textTransform: 'uppercase' }}>General</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Battery Alerts */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>Battery Alerts</span>
                      <div
                        onClick={() => {
                          const newVal = !batteryAlertsEnabled;
                          setBatteryAlertsEnabled(newVal);
                          localStorage.setItem("battery-alerts", String(newVal));
                        }}
                        style={{
                          width: 34, height: 20, borderRadius: 10,
                          background: batteryAlertsEnabled ? '#4facfe' : 'rgba(255,255,255,0.1)',
                          position: 'relative', cursor: 'pointer', transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          width: 16, height: 16, borderRadius: '50%', background: 'white',
                          position: 'absolute', top: 2, left: batteryAlertsEnabled ? 16 : 2,
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                        }} />
                      </div>
                    </div>

                    {/* Hour Format */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>Hour Format</span>
                      <select
                        value={hourFormat ? "12-hr" : "24-hr"}
                        onChange={handleHourFormatChange}
                        style={{
                          background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white',
                          padding: '4px 8px', borderRadius: 8, fontSize: 11, outline: 'none'
                        }}
                      >
                        <option value="12-hr">12-Hour</option>
                        <option value="24-hr">24-Hour</option>
                      </select>
                    </div>

                    {/* Weather Unit */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>Weather Unit</span>
                      <div style={{ display: 'flex', gap: 5, background: 'rgba(255,255,255,0.05)', padding: 3, borderRadius: 8 }}>
                        {['f', 'c'].map(unit => (
                          <div
                            key={unit}
                            onClick={() => {
                              setweatherUnit(unit);
                              localStorage.setItem("weather-unit", unit);
                            }}
                            style={{
                              padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                              background: weatherUnit === unit ? 'rgba(255,255,255,0.1)' : 'transparent',
                              color: weatherUnit === unit ? '#fff' : 'rgba(255,255,255,0.4)',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {unit.toUpperCase()}°
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Auto Revert Time */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>Auto Revert Time</span>
                        <span style={{ fontSize: 11, opacity: 0.5 }}>{autoRevertTime / 1000}s</span>
                      </div>
                      <input
                        type="range"
                        min="1000"
                        max="20000"
                        step="500"
                        value={autoRevertTime}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setAutoRevertTime(val);
                          localStorage.setItem("auto-revert-time", String(val));
                        }}
                        style={{ width: '100%', accentColor: '#4facfe' }}
                      />
                    </div>

                    {/* Scroll Action */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>Scroll Action</span>
                      <div style={{ position: 'relative' }}>
                        <select
                          value={scrollAction}
                          onChange={(e) => {
                            setScrollAction(e.target.value);
                            localStorage.setItem("scroll-action", e.target.value);
                          }}
                          style={{
                            appearance: 'none',
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white',
                            padding: '4px 24px 4px 10px',
                            borderRadius: 8,
                            fontSize: 11,
                            outline: 'none',
                            cursor: 'pointer',
                            minWidth: '100px'
                          }}
                        >
                          <option value="volume" style={{ background: '#1a1a1a' }}>Volume</option>
                          <option value="brightness" style={{ background: '#1a1a1a' }}>Brightness</option>
                        </select>
                        <ChevronDown size={12} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} />
                      </div>
                    </div>

                    {/* AI Model Selection */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>AI Model</span>
                        <div style={{ position: 'relative' }}>
                          <select
                            value={aiModel}
                            onChange={(e) => {
                              setAiModel(e.target.value);
                              localStorage.setItem("ai-model", e.target.value);
                            }}
                            style={{
                              appearance: 'none',
                              background: 'rgba(255,255,255,0.08)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              color: 'white',
                              padding: '4px 24px 4px 10px',
                              borderRadius: 8,
                              fontSize: 11,
                              outline: 'none',
                              cursor: 'pointer',
                              minWidth: '120px'
                            }}
                          >
                            <option value="openai/gpt-3.5-turbo" style={{ background: '#1a1a1a' }}>GPT-3.5 Turbo</option>
                            <option value="openai/gpt-4" style={{ background: '#1a1a1a' }}>GPT-4</option>
                            <option value="anthropic/claude-2" style={{ background: '#1a1a1a' }}>Claude 2</option>
                            <option value="google/palm-2-chat-bison" style={{ background: '#1a1a1a' }}>PaLM 2</option>
                            <option value="custom" style={{ background: '#1a1a1a' }}>Custom (OpenRouter)</option>
                          </select>
                          <ChevronDown size={12} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} />
                        </div>
                      </div>
                      {aiModel === 'custom' && (
                        <input
                          type="text"
                          placeholder="Enter model ID (e.g. meta-llama/llama-2-70b-chat)"
                          value={customModel}
                          onChange={(e) => {
                            setCustomModel(e.target.value);
                            localStorage.setItem("custom-model", e.target.value);
                          }}
                          style={{
                            width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none',
                            background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 11, outline: 'none'
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Island Appearance Section */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.3, marginBottom: 10, textTransform: 'uppercase' }}>Appearance</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Island Border */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>Island Border</span>
                      <div
                        onClick={() => {
                          const newVal = !islandBorderEnabled;
                          setIslandBorderEnabled(newVal);
                          localStorage.setItem("island-border", String(newVal));
                        }}
                        style={{
                          width: 34, height: 20, borderRadius: 10,
                          background: islandBorderEnabled ? '#4facfe' : 'rgba(255,255,255,0.1)',
                          position: 'relative', cursor: 'pointer', transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          width: 16, height: 16, borderRadius: '50%', background: 'white',
                          position: 'absolute', top: 2, left: islandBorderEnabled ? 16 : 2,
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                        }} />
                      </div>
                    </div>

                    {islandBorderEnabled && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, opacity: 0.7 }}>Border Color</span>
                          <input
                            type="color"
                            value={islandBorderColor}
                            onChange={(e) => {
                              setIslandBorderColor(e.target.value);
                              localStorage.setItem("island-border-color", e.target.value);
                            }}
                            style={{ width: 30, height: 20, border: 'none', background: 'transparent', cursor: 'pointer' }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 12, opacity: 0.7 }}>Thickness</span>
                            <span style={{ fontSize: 11, opacity: 0.5 }}>{islandBorderThickness}px</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="5"
                            step="0.5"
                            value={islandBorderThickness}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setIslandBorderThickness(val);
                              localStorage.setItem("island-border-thickness", String(val));
                            }}
                            style={{ width: '100%', accentColor: '#4facfe' }}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, opacity: 0.7 }}>Border Style</span>
                          <div style={{ position: 'relative' }}>
                            <select
                              value={islandBorderStyle}
                              onChange={(e) => {
                                setIslandBorderStyle(e.target.value);
                                localStorage.setItem("island-border-style", e.target.value);
                              }}
                              style={{
                                appearance: 'none',
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white',
                                padding: '2px 20px 2px 8px',
                                borderRadius: 6,
                                fontSize: 10,
                                outline: 'none',
                                cursor: 'pointer',
                                minWidth: '80px'
                              }}
                            >
                              <option value="solid" style={{ background: '#1a1a1a' }}>Solid</option>
                              <option value="dashed" style={{ background: '#1a1a1a' }}>Dashed</option>
                              <option value="dotted" style={{ background: '#1a1a1a' }}>Dotted</option>
                              <option value="double" style={{ background: '#1a1a1a' }}>Double</option>
                            </select>
                            <ChevronDown size={10} style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Font Size */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>Font Size</span>
                        <span style={{ fontSize: 11, opacity: 0.5 }}>{fontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="24"
                        step="1"
                        value={fontSize}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setFontSize(val);
                          localStorage.setItem("island-font-size", String(val));
                        }}
                        style={{ width: '100%', accentColor: '#4facfe' }}
                      />
                    </div>

                    {/* Corner Radius */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>Corner Radius</span>
                        <span style={{ fontSize: 11, opacity: 0.5 }}>{cornerRadius}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="1"
                        value={cornerRadius}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCornerRadius(val);
                          localStorage.setItem("island-corner-radius", String(val));
                        }}
                        style={{ width: '100%', accentColor: '#4facfe' }}
                      />
                    </div>

                    {/* Island Opacity */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>Island Opacity</span>
                        <span style={{ fontSize: 11, opacity: 0.5 }}>{Math.round(opacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.01"
                        value={opacity}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setOpacity(val);
                          localStorage.setItem("island-opacity", String(val));
                        }}
                        style={{ width: '100%', accentColor: '#4facfe' }}
                      />
                    </div>

                    {/* Island Position */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>Top Position</span>
                        <span style={{ fontSize: 11, opacity: 0.5 }}>{islandPosition}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={islandPosition}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setIslandPosition(val);
                          localStorage.setItem("island-position", String(val));
                        }}
                        style={{ width: '100%', accentColor: '#4facfe' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Standby Mode Section */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.3, marginBottom: 10, textTransform: 'uppercase' }}>Standby & Modes</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Standby Mode */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>Standby Mode</span>
                      <div
                        onClick={() => {
                          const newVal = !standbyBorderEnabled;
                          setStandbyEnabled(newVal);
                          localStorage.setItem("standby-mode", String(newVal));
                          if (newVal) setLargeStandbyEnabled(false);
                        }}
                        style={{
                          width: 34, height: 20, borderRadius: 10,
                          background: standbyBorderEnabled ? '#4facfe' : 'rgba(255,255,255,0.1)',
                          position: 'relative', cursor: 'pointer', transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          width: 16, height: 16, borderRadius: '50%', background: 'white',
                          position: 'absolute', top: 2, left: standbyBorderEnabled ? 16 : 2,
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                        }} />
                      </div>
                    </div>

                    {/* Large Standby Mode */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>Large Standby</span>
                      <div
                        onClick={() => {
                          const newVal = !largeStandbyEnabled;
                          setLargeStandbyEnabled(newVal);
                          localStorage.setItem("large-standby-mode", String(newVal));
                          if (newVal) setStandbyEnabled(false);
                        }}
                        style={{
                          width: 34, height: 20, borderRadius: 10,
                          background: largeStandbyEnabled ? '#4facfe' : 'rgba(255,255,255,0.1)',
                          position: 'relative', cursor: 'pointer', transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          width: 16, height: 16, borderRadius: '50%', background: 'white',
                          position: 'absolute', top: 2, left: largeStandbyEnabled ? 16 : 2,
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                        }} />
                      </div>
                    </div>

                    {/* Hide Island when Not Active */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>Hide when Not Active</span>
                      <div
                        onClick={() => {
                          const newVal = !hideNotActiveIslandEnabled;
                          sethideNotActiveIslandEnabled(newVal);
                          localStorage.setItem("hide-island-notactive", String(newVal));
                        }}
                        style={{
                          width: 34, height: 20, borderRadius: 10,
                          background: hideNotActiveIslandEnabled ? '#4facfe' : 'rgba(255,255,255,0.1)',
                          position: 'relative', cursor: 'pointer', transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          width: 16, height: 16, borderRadius: '50%', background: 'white',
                          position: 'absolute', top: 2, left: hideNotActiveIslandEnabled ? 16 : 2,
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                        }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reset Section */}
                <div style={{ marginTop: 'auto', paddingTop: 10 }}>
                  <div
                    onClick={handleResetSettings}
                    style={{
                      padding: '12px',
                      borderRadius: 12,
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      fontSize: 12,
                      fontWeight: 800,
                      textAlign: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    RESET ALL SETTINGS
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Clock on Left */}
          <div style={{ position: 'absolute', top: 15, left: 25, right: 25, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none' }}>
            {/* Weather on Left */}
            <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => setView('weather')}>
                <Cloud size={18} color={textColor} />
                <span style={{ fontSize: 16, fontWeight: 500 }}>{weather ? `${weather}°` : "--"}</span>
              </div>
            </div>

            {/* Battery on Right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, pointerEvents: 'auto' }}>
              <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.9 }}>{percent}%</span>
              <div style={{ width: 22, height: 12, position: 'relative' }}>
                {charging ? (
                  <img src={chargingIcon} alt="Charging" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : percent <= 20 ? (
                  <img src={lowBatteryIcon} alt="Low Battery" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <div style={{
                    width: '100%', height: '100%', border: `1.5px solid ${textColor}`,
                    borderRadius: 2.5, padding: 1, position: 'relative'
                  }}>
                    <div style={{
                      width: `${percent}%`, height: '100%', background: percent <= 20 ? '#ef4444' : percent <= 60 ? '#fbbf24' : '#4ade80',
                      borderRadius: 1
                    }} />
                    <div style={{
                      position: 'absolute', right: -3, top: '50%', transform: 'translateY(-50%)',
                      width: 2, height: 4, background: textColor, borderRadius: '0 1px 1px 0'
                    }} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Big Clock Restoration */}
          <div style={{
            textAlign: 'center',
            transformOrigin: 'center center',
            marginTop: 10,
            fontFamily: clockFont === 'w95' ? '"MS Sans Serif", "Microsoft Sans Serif", sans-serif' :
              clockFont === 'OpenRunde' ? '"OpenRunde", sans-serif' :
                clockFont
          }}>
            {clockStyle === 'analog' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15 }}>
                <AnalogClock size={140} color={textColor} style={analogStyle} />
                <h2 style={{ fontSize: 16, margin: 0, opacity: 0.5, letterSpacing: 0.5, fontWeight: 500 }}>{formatDateShort()}</h2>
              </div>
            ) : (
              <>
                <h1 style={{ fontSize: 72, margin: 0, lineHeight: 1, fontWeight: 700, letterSpacing: -2 }}>{time}</h1>
                <h2 style={{ fontSize: 16, margin: '5px 0 0 0', opacity: 0.5, letterSpacing: 0.5, fontWeight: 500 }}>{formatDateShort()}</h2>
              </>
            )}
          </div>
        </div>
        {/* Music View Redesign */}
        <div style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          opacity: (view === 'music' && mode === 'large') ? 1 : 0,
          pointerEvents: (view === 'music' && mode === 'large') ? 'auto' : 'none',
          transform: getHorizontalTransform('music'),
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
        }}>
          {/* Dynamic Background Blur */}
          <div style={{
            position: 'absolute', top: '-20%', left: '-20%', width: '140%', height: '140%',
            backgroundImage: `url(${spotifyTrack?.artwork_url || ''})`,
            backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(50px) brightness(0.4)',
            zIndex: -1, opacity: 0.6, transition: 'background-image 0.5s ease-in-out'
          }} />


          <div style={{ display: 'flex', alignItems: 'center', width: '90%', gap: 30, zIndex: 1 }}>
            {isPlaying || spotifyTrack?.name ? (
              <>
                <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
                  {spotifyTrack?.artwork_url ? (
                    <img src={spotifyTrack.artwork_url} style={{ width: '100%', height: '100%', borderRadius: 20, boxShadow: '0 20px 40px rgba(0,0,0,0.6)', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, backdropFilter: 'blur(10px)' }}>🎵</div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 15, textAlign: 'left', overflow: 'hidden' }}>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'white', letterSpacing: -1 }}>{spotifyTrack?.name || "No Track Playing"}</div>
                    <div style={{ fontSize: 16, opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'white', fontWeight: 500, marginTop: 2 }}>{spotifyTrack?.artist || "System Media"}</div>
                  </div>

                  <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginTop: 5 }}>
                    <ChevronLeft size={28} style={{ cursor: 'pointer', opacity: 0.6 }} onClick={() => window.electronAPI?.controlSystemMedia('previous')} />
                    <div onClick={() => window.electronAPI?.controlSystemMedia('playpause')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', borderRadius: '50%', width: 48, height: 48, color: 'black' }}>
                      {isPlaying ? <span style={{ fontSize: 20 }}>⏸</span> : <span style={{ fontSize: 20, transform: 'translateX(2px)' }}>▶</span>}
                    </div>
                    <ChevronRight size={28} style={{ cursor: 'pointer', opacity: 0.6 }} onClick={() => window.electronAPI?.controlSystemMedia('next')} />
                  </div>
                </div>
              </>
            ) : (
              <div style={{ width: '100%', textAlign: 'center', opacity: 0.5, fontSize: 14, fontWeight: 500 }}>Nothing is playing</div>
            )}
          </div>
        </div>

        {/* Weather View */}
        <div style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          opacity: (view === 'weather' && mode === 'large') ? 1 : 0,
          pointerEvents: (view === 'weather' && mode === 'large') ? 'auto' : 'none',
          transform: view === 'weather_details' ? (layoutOrder.weather[0] === 'details' ? 'translateY(-100%)' : 'translateY(100%)') : getHorizontalTransform('weather'),
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{ marginBottom: 15, transform: 'scale(0.9)' }}>
            {getWeatherStyles().icon}
          </div>
          <h1 style={{ fontSize: 56, margin: 0, fontWeight: 700, letterSpacing: -2 }}>{weather || "--"}º</h1>
          <div style={{ fontSize: 16, fontWeight: 600, opacity: 0.8, marginTop: 2 }}>{weatherCondition}</div>
          <div style={{ fontSize: 11, opacity: 0.5, marginTop: 8, letterSpacing: 1 }}>{formatDateShort().toUpperCase()}</div>
        </div>

        {/* Weather Details View */}
        <div style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          opacity: (view === 'weather_details' && mode === 'large') ? 1 : 0,
          pointerEvents: (view === 'weather_details' && mode === 'large') ? 'auto' : 'none',
          transform: view === 'weather_details' ? 'translate(0,0)' : 'translateY(100%)',
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          {weatherDetails && (
            <div style={{
              width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 15,
              animation: 'appear 0.3s ease-out', padding: '0 20px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <Wind size={18} color={textColor} opacity={0.7} />
                <span style={{ fontSize: 12, fontWeight: 700 }}>{weatherDetails.wind_kph} <span style={{ fontSize: 9, opacity: 0.5 }}>KM/H</span></span>
                <span style={{ fontSize: 9, opacity: 0.5, fontWeight: 800 }}>WIND</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <Droplets size={18} color={textColor} opacity={0.7} />
                <span style={{ fontSize: 12, fontWeight: 700 }}>{weatherDetails.humidity}%</span>
                <span style={{ fontSize: 9, opacity: 0.5, fontWeight: 800 }}>HUMIDITY</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <Sun size={18} color={textColor} opacity={0.7} />
                <span style={{ fontSize: 12, fontWeight: 700 }}>{weatherDetails.uv}</span>
                <span style={{ fontSize: 9, opacity: 0.5, fontWeight: 800 }}>UV INDEX</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <Thermometer size={18} color={textColor} opacity={0.7} />
                <span style={{ fontSize: 12, fontWeight: 700 }}>{weatherDetails.feelslike_c}º</span>
                <span style={{ fontSize: 9, opacity: 0.5, fontWeight: 800 }}>FEELS LIKE</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{
                  fontSize: 10, fontWeight: 900, width: 22, height: 22, borderRadius: '50%',
                  border: `1.5px solid ${textColor}`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', opacity: 0.7
                }}>AQI</div>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{Math.round(weatherDetails.air_quality?.["us-epa-index"] || 0)}</span>
                <span style={{ fontSize: 9, opacity: 0.5, fontWeight: 800 }}>AIR QUALITY</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <Cloud size={18} color={textColor} opacity={0.7} />
                <span style={{ fontSize: 12, fontWeight: 700 }}>{weatherDetails.cloud}%</span>
                <span style={{ fontSize: 9, opacity: 0.5, fontWeight: 800 }}>CLOUDS</span>
              </div>
            </div>
          )}
        </div>

        {/* Search View */}
        <div style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          opacity: (view === 'search' && mode === 'large') ? 1 : 0,
          pointerEvents: (view === 'search' && mode === 'large') ? 'auto' : 'none',
          transform: view === 'search_urls' ? (layoutOrder.search[0] === 'urls' ? 'translateY(-100%)' : 'translateY(100%)') : getHorizontalTransform('search'),
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <h2 style={{ fontSize: 18, marginBottom: 15, fontWeight: 700 }}>Search / URL</h2>
          <input
            autoFocus={view === 'search' && mode === 'large'}
            type="text"
            placeholder="Search Google or type URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '90%', padding: '12px 20px', borderRadius: 25, border: 'none', outline: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 16 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = searchQuery;
                if (!val) return;
                const { url, isDirectUrl } = resolveSearchInput(val);
                if (isDirectUrl) {
                  setEmbeddedWebUrl(url);
                  setWebviewReloadKey((prev) => prev + 1);
                } else {
                  window.electronAPI?.openExternal ? window.electronAPI.openExternal(url) : window.open(url, "_blank");
                  setView('home');
                  setSearchQuery('');
                }
              }
              if (e.key === 'Escape') {
                if (embeddedWebUrl) {
                  setEmbeddedWebUrl('');
                } else {
                  setView('home');
                }
              }
            }}
          />

          {embeddedWebUrl && (
            <div style={{
              width: '95%',
              marginTop: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              height: 360
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 11, opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{embeddedWebUrl}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => window.electronAPI?.openExternal ? window.electronAPI.openExternal(embeddedWebUrl) : window.open(embeddedWebUrl, "_blank")}
                    style={{ border: 'none', borderRadius: 10, padding: '5px 10px', background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: 10, cursor: 'pointer' }}
                  >
                    Open External
                  </button>
                  <button
                    onClick={() => setEmbeddedWebUrl('')}
                    style={{ border: 'none', borderRadius: 10, padding: '5px 10px', background: 'rgba(239,68,68,0.25)', color: '#fff', fontSize: 10, cursor: 'pointer' }}
                  >
                    Close
                  </button>
                </div>
              </div>
              <webview
                key={webviewReloadKey}
                src={embeddedWebUrl}
                allowpopups="true"
                style={{ width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)' }}
              />
            </div>
          )}

          {/* Search Results */}
          {!embeddedWebUrl && searchResults.length > 0 && (
            <div style={{
              width: '95%',
              marginTop: 15,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              animation: 'appear 0.2s ease-out',
              overflowY: 'auto',
              maxHeight: 400,
              paddingRight: 5
            }}>
              {searchResults.map((result, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (!result.url) return;
                    setEmbeddedWebUrl(result.url);
                    setWebviewReloadKey((prev) => prev + 1);
                  }}
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 15,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    transition: 'all 0.2s ease',
                    border: '1px solid rgba(255,255,255,0.03)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {result.icon ? (
                      <img
                        src={result.icon.startsWith('http') ? result.icon : `https://duckduckgo.com${result.icon}`}
                        alt="icon"
                        style={{ width: 16, height: 16, borderRadius: 4, objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = result.url ? `https://www.google.com/s2/favicons?sz=32&domain=${new URL(result.url).hostname}` : '';
                        }}
                      />
                    ) : result.url ? (
                      <img
                        src={`https://www.google.com/s2/favicons?sz=32&domain=${new URL(result.url).hostname}`}
                        alt="icon"
                        style={{ width: 16, height: 16, borderRadius: 4 }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : null}
                    {result.isSuggestion ? <Search size={12} opacity={0.4} /> : !result.url && <Box size={12} color="#4facfe" />}
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {result.title}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, opacity: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {result.description}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick URLs View */}
        <div style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          opacity: (view === 'search_urls' && mode === 'large') ? 1 : 0,
          pointerEvents: (view === 'search_urls' && mode === 'large') ? 'auto' : 'none',
          transform: view === 'search_urls' ? 'translate(0,0)' : 'translateY(100%)',
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.4, letterSpacing: 1.5, marginBottom: 15 }}>QUICK APPS</div>
          <div style={{
            width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 15,
            animation: 'appear 0.3s ease-out', padding: '0 20px', justifyItems: 'center'
          }}>
            {pinnedUrls.slice(0, 9).map((url, idx) => {
              const domain = new URL(url).hostname.replace('www.', '');
              const iconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
              return (
                <div key={idx} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div
                    onClick={() => {
                      if (isEditingUrls) {
                        setEditingUrlIndex(idx);
                        setNewUrlData({ name: '', url: url });
                        setShowAddUrlModal(true);
                      } else {
                        window.electronAPI?.openExternal ? window.electronAPI.openExternal(url) : window.open(url, "_blank");
                        setView('home');
                      }
                    }}
                    style={{
                      width: 45, height: 45, borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                      background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      border: isEditingUrls ? '1px solid rgba(255,255,255,0.3)' : 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <img src={iconUrl} alt={domain} style={{ width: '60%', height: '60%', objectFit: 'contain', opacity: isEditingUrls ? 0.5 : 1 }} />

                    {isEditingUrls && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                        <Edit2 size={14} color="white" />
                      </div>
                    )}
                  </div>

                  {isEditingUrls && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        const newUrls = pinnedUrls.filter((_, i) => i !== idx);
                        setPinnedUrls(newUrls);
                        localStorage.setItem("pinned-urls", JSON.stringify(newUrls));
                      }}
                      style={{
                        position: 'absolute', top: -5, right: -5, width: 18, height: 18, borderRadius: '50%',
                        background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', zIndex: 10, border: '2px solid rgba(0,0,0,0.5)'
                      }}
                    >
                      <X size={10} color="white" strokeWidth={3} />
                    </div>
                  )}
                </div>
              );
            })}
            {pinnedUrls.length < 9 && (
              <div
                onClick={() => setShowAddUrlModal(true)}
                style={{
                  width: 45, height: 45, borderRadius: 12, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease', border: '1px dashed rgba(255,255,255,0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Plus size={20} color={textColor} opacity={0.5} />
              </div>
            )}
          </div>

          {/* Edit Toggle Button */}
          <div
            onClick={() => setIsEditingUrls(!isEditingUrls)}
            style={{
              position: 'absolute', bottom: 15, right: 15, width: 24, height: 24, borderRadius: 6,
              background: isEditingUrls ? 'rgba(79, 172, 254, 0.2)' : 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              transition: 'all 0.2s ease', border: isEditingUrls ? '1px solid rgba(79, 172, 254, 0.4)' : '1px solid rgba(255,255,255,0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isEditingUrls ? 'rgba(79, 172, 254, 0.3)' : 'rgba(255,255,255,0.1)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isEditingUrls ? 'rgba(79, 172, 254, 0.2)' : 'rgba(255,255,255,0.05)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Settings size={12} color={isEditingUrls ? '#4facfe' : textColor} opacity={isEditingUrls ? 1 : 0.5} />
          </div>

          {/* Custom Add URL Modal */}
          {showAddUrlModal && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', borderRadius: 15, zIndex: 100,
              display: 'flex', flexDirection: 'column', padding: '20px', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              justifyContent: 'center', gap: 15
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.4, letterSpacing: 1.5, textAlign: 'center' }}>
                {editingUrlIndex !== null ? 'EDIT QUICK APP' : 'ADD QUICK APP'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  type="text"
                  placeholder="App Name (optional)"
                  value={newUrlData.name}
                  onChange={(e) => setNewUrlData({ ...newUrlData, name: e.target.value })}
                  style={{ padding: '10px 15px', borderRadius: 12, border: 'none', outline: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 13 }}
                />
                <input
                  type="text"
                  placeholder="URL (e.g. https://google.com)"
                  value={newUrlData.url}
                  onChange={(e) => setNewUrlData({ ...newUrlData, url: e.target.value })}
                  style={{ padding: '10px 15px', borderRadius: 12, border: 'none', outline: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 13 }}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <div
                  onClick={() => {
                    let finalUrl = newUrlData.url.trim();
                    if (finalUrl) {
                      if (!/^https?:\/\//i.test(finalUrl)) finalUrl = 'https://' + finalUrl;

                      let newUrls;
                      if (editingUrlIndex !== null) {
                        newUrls = [...pinnedUrls];
                        newUrls[editingUrlIndex] = finalUrl;
                      } else {
                        newUrls = [...pinnedUrls, finalUrl];
                      }

                      setPinnedUrls(newUrls);
                      localStorage.setItem("pinned-urls", JSON.stringify(newUrls));
                    }
                    setShowAddUrlModal(false);
                    setNewUrlData({ name: '', url: '' });
                    setEditingUrlIndex(null);
                  }}
                  style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'rgba(255, 255, 255, 0.08)', color: '#ffffff', fontSize: 12, fontWeight: 700, textAlign: 'center', cursor: 'pointer' }}
                >
                  SAVE
                </div>
                <div
                  onClick={() => {
                    setShowAddUrlModal(false);
                    setNewUrlData({ name: '', url: '' });
                    setEditingUrlIndex(null);
                  }}
                  style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'rgba(239, 68, 68, 0.14)', color: '#ef4444', fontSize: 12, fontWeight: 800, textAlign: 'center', cursor: 'pointer' }}
                >
                  CANCEL
                </div>
              </div>
            </div>
          )}
        </div>



        {/* App Shortcuts View */}
        <div style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          opacity: (view === 'app_shortcuts' && mode === 'large') ? 1 : 0,
          pointerEvents: (view === 'app_shortcuts' && mode === 'large') ? 'auto' : 'none',
          transform: getHorizontalTransform('app_shortcuts'),
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{ position: 'absolute', top: 15, left: 20, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.4, letterSpacing: 1.5 }}>APP SHORTCUTS</div>
          </div>
          
          <div 
            onClick={() => setIsEditingApps(!isEditingApps)}
            style={{ 
                position: 'absolute', bottom: 15, left: 20, zIndex: 10, cursor: 'pointer',
                opacity: isEditingApps ? 1 : 0.4, transition: 'opacity 0.2s',
                display: 'flex', alignItems: 'center', gap: 5
            }}
            title="Manage Shortcuts"
          >
            <Settings size={14} color={textColor} />
          </div>

          <div style={{
            width: '100%', 
            display: appShortcuts.length === 0 ? 'flex' : 'grid', 
            gridTemplateColumns: appShortcuts.length === 0 ? 'unset' : 'repeat(4, 1fr)', 
            gap: 15,
            animation: 'appear 0.3s ease-out', 
            padding: '0 10px', 
            justifyItems: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            maxHeight: '260px', overflowY: 'auto', marginTop: 20
          }}>
            {appShortcuts.map((app, idx) => (
                <div key={idx} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <div
                        onClick={() => {
                             if (!isEditingApps) {
                                window.electronAPI?.openApp ? window.electronAPI.openApp(app.path) : console.log("Open", app.path);
                                setView('home');
                             }
                        }}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            const newApps = appShortcuts.filter((_, i) => i !== idx);
                            setAppShortcuts(newApps);
                        }}
                        style={{
                            width: 50, height: 50, borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                            background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s ease', position: 'relative',
                            opacity: isEditingApps ? 0.8 : 1
                        }}
                        onMouseEnter={(e) => !isEditingApps && (e.currentTarget.style.transform = 'scale(1.1)')}
                        onMouseLeave={(e) => !isEditingApps && (e.currentTarget.style.transform = 'scale(1)')}
                    >
                       {app.icon ? (
                           <img src={app.icon} alt={app.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                       ) : (
                           <Box size={20} color={textColor} />
                       )}
                    </div>
                    
                    {isEditingApps && (
                       <div
                         onClick={(e) => {
                           e.stopPropagation(); 
                           const newApps = appShortcuts.filter((_, i) => i !== idx);
                           setAppShortcuts(newApps);
                         }}
                         style={{
                           position: 'absolute', top: -6, right: -6, 
                           zIndex: 20, cursor: 'pointer',
                           color: 'rgba(255,255,255,0.6)',
                           transition: 'all 0.2s ease',
                           padding: 2
                         }}
                         onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#ef4444';
                            e.currentTarget.style.filter = 'drop-shadow(0 0 2px rgba(239, 68, 68, 0.5))';
                         }}
                         onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                            e.currentTarget.style.filter = 'none';
                         }}
                       >
                         <X size={12} strokeWidth={3} />
                       </div>
                    )}

                    <span style={{ fontSize: 10, opacity: 0.7, maxWidth: 60, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.name}</span>
                </div>
            ))}
            
            {/* App Shortcut Options Modal */}
            {showAppShortcutModal && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', borderRadius: 15, zIndex: 100,
                display: 'flex', flexDirection: 'column', padding: '20px', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                justifyContent: 'center', gap: 15
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.4, letterSpacing: 1.5, textAlign: 'center' }}>
                  ADD SHORTCUT
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                   <div
                      onClick={async () => {
                          if (window.electronAPI?.selectFile) {
                              const path = await window.electronAPI.selectFile();
                              if (path) {
                                  // Get icon
                                  let icon = null;
                                  if (window.electronAPI?.getAppIcon) {
                                      icon = await window.electronAPI.getAppIcon(path);
                                  }
                                  // Extract name from path (last part, remove extension)
                                  const name = path.split('\\').pop().split('/').pop().replace(/\.[^/.]+$/, "");
                                  setAppShortcuts([...appShortcuts, { name, path, icon }]);
                                  setShowAppShortcutModal(false);
                              }
                          }
                      }}
                      style={{
                          padding: '12px', borderRadius: 12, background: 'rgba(255, 255, 255, 0.08)',
                          color: '#ffffff', fontSize: 13, fontWeight: 500, textAlign: 'center', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                   >
                      <Folder size={16} /> Find File...
                   </div>
                   
                   <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.5 }}>
                      <div style={{ flex: 1, height: 1, background: 'white' }} />
                      <span style={{ fontSize: 10 }}>OR</span>
                      <div style={{ flex: 1, height: 1, background: 'white' }} />
                   </div>

                   <input
                      type="text"
                      placeholder="Enter Path (e.g. C:\Windows\System32\notepad.exe)"
                      value={newAppPath}
                      onChange={(e) => setNewAppPath(e.target.value)}
                      onKeyDown={async (e) => {
                          if (e.key === 'Enter' && newAppPath.trim()) {
                              const path = newAppPath.trim();
                              let icon = null;
                              if (window.electronAPI?.getAppIcon) {
                                  icon = await window.electronAPI.getAppIcon(path);
                              }
                              const name = path.split('\\').pop().split('/').pop().replace(/\.[^/.]+$/, "");
                              setAppShortcuts([...appShortcuts, { name, path, icon }]);
                              setShowAppShortcutModal(false);
                              setNewAppPath('');
                          }
                      }}
                      style={{ padding: '10px 15px', borderRadius: 12, border: 'none', outline: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 13 }}
                   />
                </div>

                <div
                  onClick={() => {
                    setShowAppShortcutModal(false);
                    setNewAppPath('');
                  }}
                  style={{ padding: '10px', borderRadius: 12, background: 'rgba(239, 68, 68, 0.14)', color: '#ef4444', fontSize: 12, fontWeight: 800, textAlign: 'center', cursor: 'pointer', marginTop: 5 }}
                >
                  CANCEL
                </div>
              </div>
            )}
            
            {appShortcuts.length < 12 && (
                <div
                    onClick={() => setShowAppShortcutModal(true)}
                    style={{
                        width: 50, height: 50, borderRadius: 12, cursor: 'pointer',
                        background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s ease', border: '1px dashed rgba(255,255,255,0.2)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 0 15px rgba(255,255,255,0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    <Plus size={20} color={textColor} opacity={0.5} />
                </div>
            )}
          </div>
        </div>

        {/* AI Chat View */}
        <div style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          opacity: (view === 'ai' && mode === 'large') ? 1 : 0,
          pointerEvents: (view === 'ai' && mode === 'large') ? 'auto' : 'none',
          transform: getHorizontalTransform('ai'),
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px 20px 20px'
        }}>
          {/* Header */}
          <div style={{ position: 'absolute', top: 15, left: 20, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.4, letterSpacing: 1.5 }}>ASK AI</div>
            <div onClick={() => setShowHistory(!showHistory)} style={{ cursor: 'pointer', opacity: 0.7, display: 'flex', alignItems: 'center', gap: 5 }}>
              <History size={14} color={textColor} />
            </div>
          </div>

          {/* History Overlay */}
          {showHistory && (
            <div style={{
              position: 'absolute', inset: '40px 10px 10px 10px', background: 'rgba(0,0,0,0.85)', borderRadius: 15, zIndex: 20,
              display: 'flex', flexDirection: 'column', overflow: 'hidden', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
              {/* Fixed History Header */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 15px', borderBottom: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)'
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.7 }}>HISTORY</span>
                <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                  <div
                    onClick={handleNewChat}
                    style={{
                      fontSize: 10, fontWeight: 700, cursor: 'pointer', background: 'rgba(255,255,255,0.1)',
                      padding: '3px 8px', borderRadius: 8, transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  >
                    NEW CHAT
                  </div>
                  <Trash2 size={12} color="#ef4444" style={{ cursor: 'pointer' }} onClick={handleClearHistory} />
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => setShowHistory(false)} />
                </div>
              </div>

              {/* Scrollable History List */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
                {chatHistory.length === 0 ? (
                  <div style={{ fontSize: 12, opacity: 0.5, textAlign: 'center', marginTop: 20 }}>No history</div>
                ) : (
                  chatHistory.slice().reverse().map((chat) => (
                    <div key={chat.id} 
                      onClick={() => {
                        // Load full session
                        if (chat.messages && Array.isArray(chat.messages)) {
                          setMessages(chat.messages);
                        } else {
                           // Fallback for old history format
                           setMessages([
                             { role: 'user', content: chat.question },
                             { role: 'assistant', content: chat.answer }
                           ]);
                        }
                        setActiveSessionId(chat.id);
                        setShowHistory(false);
                      }}
                      style={{
                        marginBottom: 12, fontSize: 12, padding: 10, borderRadius: 10,
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                        position: 'relative',
                        paddingRight: 30,
                        cursor: 'pointer',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    >
                      <div
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.electronAPI?.deleteChatHistoryItem) {
                            await window.electronAPI.deleteChatHistoryItem(chat.id);
                          }
                          const newHistory = chatHistory.filter(c => c.id !== chat.id);
                          setChatHistory(newHistory);
                        }}
                        style={{
                          position: 'absolute', top: 8, right: 8, cursor: 'pointer', opacity: 0.4,
                          transition: 'opacity 0.2s ease', padding: 2
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.4'}
                      >
                        <X size={12} color="#ef4444" />
                      </div>
                      <div style={{ opacity: 0.5, fontSize: 10, marginBottom: 4 }}>{new Date(chat.timestamp).toLocaleString()}</div>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>{chat.title || chat.question}</div>
                      <div style={{ opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                         {chat.messages && chat.messages.length > 0 
                             ? chat.messages[chat.messages.length - 1].content.substring(0, 50) + "..."
                             : (chat.answer ? chat.answer.substring(0, 50) + "..." : "")}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', paddingRight: 5, marginBottom: 10 }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', opacity: 0.3, fontSize: 12, marginTop: 'auto', marginBottom: 'auto' }}>How can I help you today?</div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.role === 'user' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                  padding: '8px 12px',
                  borderRadius: 12,
                  fontSize: 13,
                  maxWidth: '85%',
                  wordBreak: 'break-word',
                  border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.1)' : 'none'
                }}>
                  {msg.content}
                </div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div style={{ width: '100%', display: 'flex', gap: 10 }}>
            <input
              autoFocus={view === 'ai' && mode === 'large'}
              type="text"
              placeholder="Type your message..."
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              style={{ flex: 1, padding: '10px 15px', borderRadius: 20, border: 'none', outline: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 13 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') askAI();
                if (e.key === 'Escape') setView('home');
              }}
            />
          </div>
        </div>

        {/* Todo View */}
        <div style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          opacity: (view === 'todo' && mode === 'large') ? 1 : 0,
          pointerEvents: (view === 'todo' && mode === 'large') ? 'auto' : 'none',
          transform: (view === (layoutOrder.todo[1] === 'calendar' ? 'todo_calendar' : 'todo_timer'))
            ? 'translateY(-100%)'
            : (view === (layoutOrder.todo[0] === 'calendar' ? 'todo_calendar' : 'todo_timer') || view === 'todo_calendar_events')
              ? 'translateY(100%)'
              : getHorizontalTransform('todo'),
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', flexDirection: 'column', padding: '40px 20px 20px 20px'
        }}>
          {/* Header */}
          <div style={{ position: 'absolute', top: 15, left: 20, zIndex: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.4, letterSpacing: 1.5 }}>TO-DO LIST</div>
          </div>

          <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', paddingRight: 5, marginBottom: 8 }}>
            {todos.length === 0 ? (
              <div style={{ textAlign: 'center', opacity: 0.3, fontSize: 13, marginTop: 'auto', marginBottom: 'auto' }}>No tasks yet</div>
            ) : (
              todos.map(todo => (
                <div key={todo.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  background: todo.completed ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)',
                  borderRadius: 14,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  boxShadow: todo.completed ? 'none' : '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  {/* Custom Checkbox */}
                  <div
                    onClick={() => toggleTodo(todo.id)}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      border: `2px solid ${todo.completed ? '#ffffff' : 'rgba(255,255,255,0.2)'}`,
                      background: todo.completed ? 'rgba(255,255,255,0.9)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}
                  >
                    {todo.completed && <Check size={12} color="black" />}
                  </div>

                  <span style={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: 500,
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    opacity: todo.completed ? 0.4 : 0.9,
                    color: textColor,
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {todo.text}
                  </span>

                  <Trash2
                    size={14}
                    color="#ef4444"
                    style={{ cursor: 'pointer', opacity: 0.3, transition: 'opacity 0.2s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.3'}
                    onClick={() => deleteTodo(todo.id)}
                  />
                </div>
              ))
            )}
          </div>

          <div style={{ width: '100%', position: 'relative' }}>
            <input
              type="text"
              value={todoInput}
              onChange={(e) => setTodoInput(e.target.value)}
              placeholder="Add task..."
              style={{ width: '100%', padding: '10px 15px', borderRadius: 20, border: 'none', outline: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 13 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTodo();
                if (e.key === 'Escape') setView('home');
              }}
            />
          </div>
        </div>

        {/* Todo Calendar View */}
        <div style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          opacity: (view === 'todo_calendar' && mode === 'large') ? 1 : 0,
          pointerEvents: (view === 'todo_calendar' && mode === 'large') ? 'auto' : 'none',
          transform: view === 'todo_calendar' ? 'translate(0,0)' : (layoutOrder.todo[0] === 'calendar' ? 'translateY(-100%)' : 'translateY(100%)'),
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', flexDirection: 'column', padding: '40px 20px 20px 20px'
        }}>
          <div style={{ position: 'absolute', top: 15, left: 20, zIndex: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.4, letterSpacing: 1.5 }}>CALENDAR</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div
              onClick={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              style={{ cursor: 'pointer', opacity: 0.4, transition: 'opacity 0.2s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.4'}
            >
              <ChevronLeft size={18} color={textColor} />
            </div>

            <div style={{ fontSize: 14, fontWeight: 700, opacity: 0.9 }}>{formatMonthTitle(calendarMonth)}</div>

            <div
              onClick={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              style={{ cursor: 'pointer', opacity: 0.4, transition: 'opacity 0.2s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.4'}
            >
              <ChevronRight size={18} color={textColor} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 10 }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, opacity: 0.35 }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {Array.from({ length: startWeekday(calendarMonth) }).map((_, idx) => (
              <div key={`pad-${idx}`} />
            ))}
            {Array.from({ length: daysInMonth(calendarMonth) }).map((_, idx) => {
              const day = idx + 1;
              const iso = toIsoDate(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
              const hasEvents = Array.isArray(calendarEvents?.[iso]) && calendarEvents[iso].length > 0;
              const isSelected = iso === selectedCalendarDate;
              const isToday = iso === getTodayIso();

              return (
                <div
                  key={iso}
                  onClick={() => {
                    setSelectedCalendarDate(iso);
                    setView('todo_calendar_events');
                  }}
                  style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    borderRadius: 9,
                    background: isSelected ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)',
                    border: isSelected ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 3,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isToday ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                    border: isToday ? '1px solid rgba(59, 130, 246, 0.55)' : '1px solid transparent'
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 900, opacity: 0.92, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{day}</div>
                  </div>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: hasEvents ? '#ffffff' : 'transparent' }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Todo Calendar Events View */}
        <div style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          opacity: (view === 'todo_calendar_events' && mode === 'large') ? 1 : 0,
          pointerEvents: (view === 'todo_calendar_events' && mode === 'large') ? 'auto' : 'none',
          transform: view === 'todo_calendar_events' ? 'translate(0,0)' : 'translateY(-100%)',
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', flexDirection: 'column', padding: '40px 20px 20px 20px'
        }}>
          <div style={{ position: 'absolute', top: 15, left: 20, zIndex: 10, display: 'flex', alignItems: 'center', gap: 15 }}>
            <div
              onClick={() => setView('todo_calendar')}
              style={{ cursor: 'pointer', opacity: 0.4, transition: 'opacity 0.2s ease', display: 'flex', alignItems: 'center', gap: 6 }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.4'}
            >
              <ChevronLeft size={14} color={textColor} />
              <div style={{ fontSize: 9, fontWeight: 800, opacity: 0.6, letterSpacing: 1.4 }}>EVENTS</div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.9 }}>{selectedCalendarDate}</div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 5 }}>
            {(Array.isArray(calendarEvents?.[selectedCalendarDate]) ? calendarEvents[selectedCalendarDate] : []).length === 0 ? (
              <div style={{ opacity: 0.3, fontSize: 13 }}>No events</div>
            ) : (
              (calendarEvents[selectedCalendarDate] || []).map((ev) => {
                const isEditing = editingCalendarEventId === ev.id;
                return (
                  <div key={ev.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 14,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <div style={{
                      minWidth: 52,
                      textAlign: 'left',
                      fontSize: 12,
                      fontWeight: 800,
                      opacity: 0.75
                    }}>
                      {ev.time || '--:--'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input
                            type="text"
                            value={editingCalendarEventText}
                            onChange={(e) => setEditingCalendarEventText(e.target.value)}
                            style={{ flex: 1, padding: '8px 10px', borderRadius: 12, border: 'none', outline: 'none', background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: 13 }}
                          />
                          <div style={{ display: 'flex', gap: 0, background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '2px 4px', alignItems: 'center' }}>
                            <input
                              type="text"
                              value={editingCalendarEventTime}
                              onChange={(e) => setEditingCalendarEventTime(formatTimeInput(e.target.value))}
                              placeholder="HH:MM"
                              style={{ width: 55, padding: '6px 5px', borderRadius: 10, border: 'none', outline: 'none', background: 'transparent', color: 'white', fontSize: 13, textAlign: 'center' }}
                            />
                            <div
                              onClick={() => setEditingCalendarEventAmPm(prev => prev === 'AM' ? 'PM' : 'AM')}
                              style={{
                                padding: '3px 6px', borderRadius: 10, background: 'rgba(255,255,255,0.1)',
                                fontSize: 9, fontWeight: 900, cursor: 'pointer', color: 'white',
                                userSelect: 'none'
                              }}
                            >
                              {editingCalendarEventAmPm}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.text}</div>
                      )}
                    </div>

                    {isEditing ? (
                      <>
                        <div
                          onClick={async () => {
                            const text = editingCalendarEventText.trim();
                            let t = (editingCalendarEventTime || '').trim();
                            if (t) {
                              t = convertTo24Hour(t, editingCalendarEventAmPm);
                            }
                            const time = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(t) ? t : '';
                            if (!text) return;
                            await updateCalendarEvent(ev.id, { text, time });
                            setEditingCalendarEventId(null);
                          }}
                          style={{ cursor: 'pointer', opacity: 0.35, transition: 'opacity 0.2s ease' }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.35'}
                        >
                          <Check size={16} color="#ffffff" />
                        </div>
                        <div
                          onClick={() => setEditingCalendarEventId(null)}
                          style={{ cursor: 'pointer', opacity: 0.35, transition: 'opacity 0.2s ease' }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.35'}
                        >
                          <X size={16} color="#ef4444" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          onClick={() => {
                            setEditingCalendarEventId(ev.id);
                            setEditingCalendarEventText(ev.text || '');
                            const parsed = parse24to12(ev.time || '');
                            setEditingCalendarEventTime(parsed.time);
                            setEditingCalendarEventAmPm(parsed.amPm);
                          }}
                          style={{ cursor: 'pointer', opacity: 0.28, transition: 'opacity 0.2s ease' }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.28'}
                        >
                          <Edit2 size={15} color={textColor} />
                        </div>
                        <Trash2
                          size={15}
                          color="#ef4444"
                          style={{ cursor: 'pointer', opacity: 0.28, transition: 'opacity 0.2s ease' }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.28'}
                          onClick={() => deleteCalendarEventByDate(selectedCalendarDate, ev.id)}
                        />
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="text"
              value={googleCalendarUrl}
              onChange={(e) => setGoogleCalendarUrl(e.target.value)}
              placeholder="Google Calendar public ICS URL"
              style={{ flex: 1, padding: '8px 12px', borderRadius: 12, border: 'none', outline: 'none', background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: 11 }}
            />
            <div
              onClick={importGoogleCalendar}
              style={{ padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
            >
              Import GCal
            </div>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="text"
              value={calendarEventInput}
              onChange={(e) => setCalendarEventInput(e.target.value)}
              placeholder="Add event..."
              style={{ flex: 1, padding: '10px 15px', borderRadius: 20, border: 'none', outline: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 13 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addCalendarEvent();
                if (e.key === 'Escape') setView('todo_calendar');
              }}
            />
            <div style={{ display: 'flex', gap: 0, background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: '2px 4px', alignItems: 'center' }}>
              <input
                type="text"
                value={calendarEventTimeInput}
                onChange={(e) => setCalendarEventTimeInput(formatTimeInput(e.target.value))}
                placeholder="HH:MM"
                style={{ width: 60, padding: '8px 8px', borderRadius: 16, border: 'none', outline: 'none', background: 'transparent', color: 'white', fontSize: 13, textAlign: 'center' }}
              />
              <div
                onClick={() => setCalendarEventAmPm(prev => prev === 'AM' ? 'PM' : 'AM')}
                style={{
                  padding: '4px 8px', borderRadius: 16, background: 'rgba(255,255,255,0.1)',
                  fontSize: 10, fontWeight: 900, cursor: 'pointer', color: 'white',
                  userSelect: 'none', transition: 'all 0.2s ease'
                }}
              >
                {calendarEventAmPm}
              </div>
            </div>
            <div
              onClick={addCalendarEvent}
              style={{
                width: 44, height: 44, borderRadius: 999,
                background: 'rgba(255, 255, 255, 0.10)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Plus size={20} color="#ffffff" />
            </div>
          </div>
        </div>

        {/* Todo Timer View */}
        <div style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          opacity: (view === 'todo_timer' && mode === 'large') ? 1 : 0,
          pointerEvents: (view === 'todo_timer' && mode === 'large') ? 'auto' : 'none',
          transform: view === 'todo_timer' ? 'translate(0,0)' : (layoutOrder.todo[0] === 'timer' ? 'translateY(-100%)' : 'translateY(100%)'),
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '40px 20px 20px 20px'
        }}>
          <div style={{ position: 'absolute', top: 15, left: 20, zIndex: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TimerIcon size={16} color={textColor} opacity={0.7} />
            <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.4, letterSpacing: 1.5 }}>WATCH</div>
          </div>

          <div style={{
            width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15,
            padding: '10px 20px'
          }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <div
                onClick={() => setWatchMode('stopwatch')}
                style={{
                  padding: '6px 10px',
                  borderRadius: 999,
                  background: watchMode === 'stopwatch' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  cursor: 'pointer',
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  opacity: watchMode === 'stopwatch' ? 0.95 : 0.55
                }}
              >
                STOPWATCH
              </div>
              <div
                onClick={() => setWatchMode('timer')}
                style={{
                  padding: '6px 10px',
                  borderRadius: 999,
                  background: watchMode === 'timer' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  cursor: 'pointer',
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  opacity: watchMode === 'timer' ? 0.95 : 0.55
                }}
              >
                TIMER
              </div>
            </div>

            {watchMode === 'timer' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div
                  onClick={() => {
                    setTimerSeconds(prev => {
                      const next = Math.max(0, prev - 60);
                      setTimerTotalSeconds(next);
                      return next;
                    });
                  }}
                  style={{ cursor: 'pointer', opacity: 0.3, transition: 'opacity 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.3'}
                >
                  <ChevronDown size={20} color={textColor} />
                </div>

                <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: -1, fontVariantNumeric: 'tabular-nums' }}>
                  {formatTimer(timerSeconds)}
                </div>

                <div
                  onClick={() => {
                    setTimerSeconds(prev => {
                      const next = prev + 60;
                      setTimerTotalSeconds(next);
                      return next;
                    });
                  }}
                  style={{ cursor: 'pointer', opacity: 0.3, transition: 'opacity 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.3'}
                >
                  <ChevronUp size={20} color={textColor} />
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: -1, fontVariantNumeric: 'tabular-nums' }}>
                {formatTimer(stopwatchSeconds)}
              </div>
            )}

            <div style={{ display: 'flex', gap: 20 }}>
              <div
                onClick={() => {
                  if (watchMode === 'timer') {
                    if (!isTimerRunning && timerSeconds > 0) setTimerTotalSeconds(timerSeconds);
                    setIsTimerRunning(!isTimerRunning);
                  } else {
                    setIsStopwatchRunning(!isStopwatchRunning);
                  }
                }}
                style={{
                  width: 44, height: 44, borderRadius: '50%', background: (watchMode === 'timer' ? isTimerRunning : isStopwatchRunning) ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {(watchMode === 'timer' ? isTimerRunning : isStopwatchRunning)
                  ? <Pause size={20} color="#ef4444" />
                  : <Play size={20} color="#ffffff" style={{ transform: 'translateX(1px)' }} />}
              </div>

              <div
                onClick={() => {
                  if (watchMode === 'timer') {
                    setIsTimerRunning(false);
                    setTimerSeconds(0);
                  } else {
                    setIsStopwatchRunning(false);
                    setStopwatchSeconds(0);
                  }
                }}
                style={{
                  width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <RotateCcw size={18} color={textColor} />
              </div>
            </div>
          </div>
        </div>

        {/* Dropbox View */}
        <div style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          opacity: (view === 'dropbox' && mode === 'large') ? 1 : 0,
          pointerEvents: (view === 'dropbox' && mode === 'large') ? 'auto' : 'none',
          transform: view === 'dropbox' ? 'translate(0,0)' : (layoutOrder.home[0] === 'dropbox' ? 'translateY(-100%)' : 'translateY(100%)'),
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', flexDirection: 'column', padding: '10px 10px 25px 10px', gap: 8
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px', marginBottom: 2 }}>
            <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.4, letterSpacing: 2 }}>DROPBOX</div>
            {tempFiles.length > 0 && (
              <div
                onClick={() => handleClear()}
                style={{
                  fontSize: 9, fontWeight: 800, color: '#ef4444', cursor: 'pointer',
                  background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: 10
                }}
              >
                CLEAR ALL
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flex: 1, gap: 10, overflow: 'hidden' }}>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingOver('copy'); }}
              onDragLeave={() => setIsDraggingOver(null)}
              onDrop={handleDropToCopy}
              style={{ flex: 1, border: `2px dashed ${isDraggingOver === 'copy' ? '#ffffff' : 'rgba(255,255,255,0.15)'}`, borderRadius: 15, display: 'flex', flexDirection: 'column', background: isDraggingOver === 'copy' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255,255,255,0.02)', transition: 'all 0.2s ease', overflow: 'hidden' }}>
              <div style={{ padding: '6px', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', fontSize: 9, fontWeight: 700, opacity: 0.6 }}>COPY TO</div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
                {tempFiles.filter(f => f.type === 'copy').map((file, idx) => (
                  <div key={idx} draggable onDragStart={(e) => handleDragStartFromPaste(e, file)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', marginBottom: 4, cursor: 'grab', fontSize: 10, position: 'relative' }}>
                    <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
                    <X
                      size={10}
                      style={{ cursor: 'pointer', opacity: 0.5 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClear(file);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingOver('move'); }}
              onDragLeave={() => setIsDraggingOver(null)}
              onDrop={async (e) => {
                e.preventDefault();
                setIsDraggingOver(null);
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                  const newFiles = Array.from(files).map(f => ({
                    name: f.name,
                    path: window.electronAPI.getPathForFile(f),
                    type: 'move'
                  }));
                  setTempFiles(prev => [...prev, ...newFiles]);
                }
              }}
              style={{ flex: 1, border: `2px dashed ${isDraggingOver === 'move' ? '#fbbf24' : 'rgba(255,255,255,0.15)'}`, borderRadius: 15, display: 'flex', flexDirection: 'column', background: isDraggingOver === 'move' ? 'rgba(251, 191, 36, 0.05)' : 'rgba(255,255,255,0.02)', transition: 'all 0.2s ease', overflow: 'hidden' }}>
              <div style={{ padding: '6px', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', fontSize: 9, fontWeight: 700, opacity: 0.6 }}>MOVE TO</div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
                {tempFiles.filter(f => f.type === 'move').map((file, idx) => (
                  <div key={idx} draggable onDragStart={(e) => handleDragStartFromPaste(e, file)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', marginBottom: 4, cursor: 'grab', fontSize: 10, position: 'relative' }}>
                    <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
                    <X
                      size={10}
                      style={{ cursor: 'pointer', opacity: 0.5 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClear(file);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Clipboard View */}
        <div style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          opacity: (view === 'clipboard' && mode === 'large') ? 1 : 0,
          pointerEvents: (view === 'clipboard' && mode === 'large') ? 'auto' : 'none',
          transform: view === 'clipboard' ? 'translate(0,0)' : (layoutOrder.home[0] === 'clipboard' ? 'translateY(-100%)' : 'translateY(100%)'),
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', flexDirection: 'column', padding: '15px 15px 20px 15px', gap: 10
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 5px', marginBottom: 2, gap: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.4, letterSpacing: 2 }}>CLIPBOARD</div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', paddingRight: 5, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {clipboardHistory.length === 0 ? (
              <div style={{ textAlign: 'center', opacity: 0.3, fontSize: 12, marginTop: 'auto', marginBottom: 'auto' }}>Clipboard is empty</div>
            ) : (
              clipboardHistory.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleCopyFromHistory(item)}
                  className="clipboard-item"
                  style={{
                    padding: '10px', borderRadius: 12, background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
                    transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }}
                >
                  {item.type === 'text' ? (
                    <div style={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: 0.9 }}>
                      {item.content}
                    </div>
                  ) : (
                    <img
                      src={item.content}
                      alt="Clipboard item"
                      style={{ maxWidth: '100%', maxHeight: '100px', borderRadius: 8, display: 'block', margin: '0 auto' }}
                    />
                  )}
                  <div style={{ fontSize: 8, opacity: 0.3, marginTop: 4, textAlign: 'right' }}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
