import { useState, useEffect, useRef, Component } from 'react';
import { Home, Music, MessageSquare, Cloud, Battery, BatteryLow, BatteryMedium, BatteryFull, Zap, ChevronLeft, ChevronRight, Sun, Moon, Box, Search, History, Trash2, X, Clipboard as ClipboardIcon, Volume2, VolumeX, Wind, Droplets, Thermometer, ChevronDown, ChevronUp, Play, Pause, RotateCcw, Timer as TimerIcon, Pin, CloudRain, Plus, List, Edit2, Settings } from 'lucide-react';
import { OpenAI } from "openai";
import "./App.css";
import lowBatteryIcon from "./assets/images/lowbattery.png";
import chargingIcon from "./assets/images/charging.png";

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
  const [bluetooth, setBluetooth] = useState(false);
  const [bluetoothAlert, setBluetoothAlert] = useState(false);
  const [prevView, setPrevView] = useState("home");
  const [showArrows, setShowArrows] = useState(localStorage.getItem("show-nav-arrows") === "true");
  const [infiniteScroll, setInfiniteScroll] = useState(localStorage.getItem("infinite-scroll") === "true");
  const [tempFiles, setTempFiles] = useState([]);
  const [isDraggingOver, setIsDraggingOver] = useState(null); // 'copy' or 'paste' or 'move'
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

  useEffect(() => {
    if (mode !== 'large' || view !== 'search_urls') {
      setIsEditingUrls(false);
    }
  }, [mode, view]);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerIntervalRef] = useState(useRef(null));
  const [showAddUrlModal, setShowAddUrlModal] = useState(false);
  const [newUrlData, setNewUrlData] = useState({ name: '', url: '' });

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
    else if (hour >= 17 && hour < 20) {
      bgColor = "linear-gradient(180deg, #4facfe 0%, #8b5cf6 100%)";
    }
    // Night: 8pm - 5am
    else {
      bgColor = "#2e1065"; // Dark purplish
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
        bgColor = "#111827";
        icon = (
          <div style={{ position: 'relative' }}>
            <Moon size={32} color={iconColor} style={{ position: 'absolute', top: -10, left: -10 }} />
            <Cloud size={48} color="rgba(255,255,255,0.7)" />
          </div>
        );
      }
    } else if (condition.includes("rain")) {
      bgColor = (hour >= 6 && hour < 18) ? "#475569" : "#0f172a";
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
    setShowHistory(false);
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
              window.electronAPI.changeVolume(direction).catch(err => {
                console.error("Volume IPC failed:", err);
              });
              setScrollValue(prev => (direction === 'up' ? Math.min(prev + 5, 100) : Math.max(prev - 5, 0)));
              setShowScrollOverlay(true);
              if (overlayTimeout.current) clearTimeout(overlayTimeout.current);
              overlayTimeout.current = setTimeout(() => setShowScrollOverlay(false), 1500);
            }
          } else if (scrollAction === 'brightness') {
            if (window.electronAPI && typeof window.electronAPI.changeBrightness === 'function') {
              window.electronAPI.changeBrightness(direction).catch(err => {
                console.error("Brightness IPC failed:", err);
              });
              setScrollValue(prev => (direction === 'up' ? Math.min(prev + 10, 100) : Math.max(prev - 10, 0)));
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

  // Auto-revert view when island collapses
  useEffect(() => {
    if (mode !== 'large' && view !== 'home' && view !== 'dropbox') {
      setView('home');
    }
  }, [mode, view]);
  // Dynamic Width/Height based on mode and view - INCREASED FOR AI/DROPBOX
  const { width, height } = (() => {
    if (mode === "large") {
      switch (view) {
        case 'clipboard': return { width: 380, height: 290 };
        case 'ai':
        case 'dropbox': return { width: 420, height: 380 };
        case 'todo': return { width: 420, height: 320 };
        case 'todo_timer': return { width: 280, height: 220 };
        case 'weather': return { width: 350, height: 220 };
        case 'weather_details': return { width: 350, height: 200 };
        case 'search_urls': return { width: 400, height: 210 };
        default: return { width: 400, height: 180 };
      }
    }
    if (mode === "quick" || isPlaying) return { width: 300, height: 43 };
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
      if (autoRevertTime <= 0) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (view !== 'home' && view !== 'dropbox') {
          setMode('still');
          setView('home');
          setBrowserSearch('');
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
    if (view === 'home' || view === 'dropbox' || autoRevertTime <= 0) return;

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
        "scroll-action": "volume"
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
    };

    syncSettings();
    window.addEventListener('storage', syncSettings);
    return () => window.removeEventListener('storage', syncSettings);
  }, []);

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

      const stream = await openai.chat.completions.create({
        model: aiModel === 'custom' ? customModel : aiModel,
        messages: [
          {
            role: "user",
            content: `Users question: ${currentQuestion}. Answer the users question in a short paragraph, 3-4 sentences. If the question is straight forward answer the question in a short 2 sentences.`
          }
        ],
        stream: true,
      });

      let fullText = "";

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
        // Save to history
        if (window.electronAPI?.saveChatHistory) {
          await window.electronAPI.saveChatHistory({
            question: currentQuestion,
            answer: fullText
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
  const refreshTempFiles = async () => {
    if (window.electronAPI?.getTempFiles) {
      const files = await window.electronAPI.getTempFiles();
      setTempFiles(files);
    }
  };

  useEffect(() => {
    if (view === 'dropbox') {
      refreshTempFiles();
    }
  }, [view]);

  useEffect(() => {
    if (window.electronAPI?.onDragFinished) {
    window.electronAPI.onDragFinished(async (filePath) => {
      // If it was a move operation, clear it from temp
      const fileObj = tempFiles.find(f => f.path === filePath);
      if (fileObj && fileObj.type === 'move') {
        await window.electronAPI.clearTempFiles([filePath]);
      }
      
      refreshTempFiles();
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
    const paths = Array.from(files).map(f => window.electronAPI.getPathForFile(f));
    // Default to copy for now
    await window.electronAPI.copyToTemp(paths);
    refreshTempFiles();
  }
};

const handleDropToMove = async (e) => {
  e.preventDefault();
  setIsDraggingOver(null);
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    const paths = Array.from(files).map(f => window.electronAPI.getPathForFile(f));
    await window.electronAPI.moveToTemp(paths);
    refreshTempFiles();
  }
};

  const handleDragStartFromPaste = (e, file) => {
    // 1. Set the DownloadURL metadata. This is a Chromium-standard way to 
    //    signal to the OS that this is a file transfer.
    const fileUrl = `file:///${file.path.replace(/\\/g, '/')}`;
    const downloadData = `application/octet-stream:${file.name}:${fileUrl}`;
    
    e.dataTransfer.setData('DownloadURL', downloadData);
    e.dataTransfer.setData('text/uri-list', fileUrl);
    e.dataTransfer.setData('text/plain', file.path);
    
    // 2. Important: Electron's startDrag will take over, but we need to 
    //    ensure we don't preventDefault if we want the dataTransfer to be valid,
    //    UNLESS startDrag is used exclusively. 
    //    However, to fix "drags the path", we will use startDrag exclusively.
    e.preventDefault();
    
    console.log(`[Renderer] Initiating NATIVE file drag for: ${file.path}`);
    
    if (window.electronAPI?.startDrag) {
      // CRITICAL: We MUST tell the window to ignore mouse events immediately
      // when a drag starts, otherwise the full-screen transparent window
      // will block the OS from seeing the desktop/apps underneath.
      window.electronAPI.setIgnoreMouseEvents(true, false);
      window.electronAPI.startDrag(file.path);
    }
  };

  const handleClear = async (file = null) => {
    if (file) {
      await window.electronAPI.clearTempFiles([file.path]);
    } else {
      await window.electronAPI.clearTempFiles([]);
    }
    refreshTempFiles();
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
    if (standbyBorderEnabled) {
      if (mode !== 'quick') setMode('quick');
    } else if (largeStandbyEnabled) {
      if (mode !== 'large') setMode('large');
    } else {
      if (mode !== 'still') setMode('still');
    }
  }, [standbyBorderEnabled, largeStandbyEnabled]);

  // Get Island Details (Copyright/Version)
  const getBatteryIcon = () => {
    const iconColor = percent >= 60 ? "#4ade80" : percent >= 30 ? "#fbbf24" : "#ef4444";
    if (percent >= 90) return <BatteryFull size={14} color={iconColor} />;
    if (percent >= 40) return <BatteryMedium size={14} color={iconColor} />;
    return <BatteryLow size={14} color={iconColor} />;
  };

  // Timer logic
  useEffect(() => {
    let interval;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

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

  // Browser Search Feature
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

  // Get Bluetooth
  useEffect(() => {
    const fetchBluetooth = async () => {
      if (window.electronAPI?.getBluetoothStatus) {
        try {
          const isConnected = await window.electronAPI.getBluetoothStatus();
          setBluetooth(isConnected);
        } catch (e) {
          console.error(e);
        }
      }
    };

    // Immediate initial fetch
    fetchBluetooth();
    
    // Set up interval (5s)
    const interval = setInterval(fetchBluetooth, 5000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (bluetooth === true) {
      setMode("quick");
      setBluetoothAlert(true);
      const timerId = setTimeout(() => {
        setMode("still");
        setBluetoothAlert(false);
      }, 3000);
      return () => {
        clearTimeout(timerId);
      };
    }
  }, [bluetooth]);

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

    // Navigation Logic: Weather <-> Search <-> Home <-> Music <-> AI <-> Todo
    if (view === 'home') {
      if (e.key === 'ArrowLeft') setView('search');
      if (e.key === 'ArrowRight') setView('music');
      if (e.key === 'ArrowDown') setView('dropbox');
      if (e.key === 'ArrowUp') setView('clipboard');
    } else if (view === 'music') {
      if (e.key === 'ArrowLeft') setView('home');
      if (e.key === 'ArrowRight') setView('ai');
    } else if (view === 'search') {
      if (e.key === 'ArrowLeft') setView('weather');
      if (e.key === 'ArrowRight') setView('home');
      if (e.key === 'ArrowDown') setView('search_urls');
    } else if (view === 'search_urls') {
      if (e.key === 'ArrowUp') setView('search');
    } else if (view === 'weather') {
      if (e.key === 'ArrowLeft') {
        if (infiniteScroll) setView('todo');
      }
      if (e.key === 'ArrowRight') setView('search');
      if (e.key === 'ArrowDown') setView('weather_details');
    } else if (view === 'weather_details') {
      if (e.key === 'ArrowUp') setView('weather');
    } else if (view === 'ai') {
      if (e.key === 'ArrowLeft') setView('music');
      if (e.key === 'ArrowRight') setView('todo');
    } else if (view === 'todo') {
      if (e.key === 'ArrowLeft') setView('ai');
      if (e.key === 'ArrowRight') {
        if (infiniteScroll) setView('weather');
      }
      if (e.key === 'ArrowDown') setView('todo_timer');
    } else if (view === 'todo_timer') {
      if (e.key === 'ArrowUp') setView('todo');
    } else if (view === 'dropbox') {
      if (e.key === 'ArrowUp') setView('home');
    } else if (view === 'clipboard') {
      if (e.key === 'ArrowDown') setView('home');
    }

      if (e.key === 'Escape') setView('home');
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mode, view]);

  return (
    <div
      id="Island"
      onDragEnter={() => {
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
        if (window.electronAPI && !isMouseDown.current) {
          // Set to ignore so clicks fall through to desktop
          // forward: true ensures the window itself can still receive hover events 
          window.electronAPI.setIgnoreMouseEvents(true, true);
        }

        // Auto-collapse logic maintained
        if (view === 'dropbox') return;

        if (standbyBorderEnabled) {
          setMode("quick");
        } else if (largeStandbyEnabled) {
          setMode("large");
        } else {
          setMode("still");
        }
      }}
      onClick={() => {
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
        backgroundImage: (view === 'weather' || view === 'weather_details') 
          ? (getWeatherStyles().bgColor.includes('gradient') ? getWeatherStyles().bgColor : 'none') 
          : `url('${bgImage}')`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
        justifyContent: "center",
        overflow: "hidden",
        fontFamily: theme === "win95" ? "w95" : "OpenRunde",
        border: theme === "win95" ? "2px solid rgb(254, 254, 254)" : islandBorderEnabled ? (alert ? `1px solid rgba(255, 38, 0, 0.34)` : bluetoothAlert ? `1px solid rgba(0, 150, 255, 0.34)` : chargingAlert ? `1px solid rgba(3, 196, 3, 0.301)` : hideNotActiveIslandEnabled ? "none" : `1px solid color-mix(in srgb, ${localStorage.getItem("text-color")}, transparent 70%)`) : "none",
        borderColor:
          theme === "win95"
            ? "#FFFFFF #808080 #808080 #FFFFFF"
            : "none",
        borderRadius:
          mode === "large" && theme === "win95"
            ? 0
            : mode === "large"
              ? cornerRadius
              : theme === "win95"
                ? 0
                : 16,
        boxShadow: hideNotActiveIslandEnabled && mode === 'still' ? "none" : '2px 2px 30px rgba(0, 0, 0, 0.07)',
        backgroundColor: (view === 'weather' || view === 'weather_details') 
          ? (getWeatherStyles().bgColor.includes('gradient') ? 'transparent' : getWeatherStyles().bgColor) 
          : (hideNotActiveIslandEnabled && mode === 'still' ? "rgba(0,0,0,0)" : localStorage.getItem("bg-color")),
        color: hideNotActiveIslandEnabled && mode === 'still' ? "rgba(0,0,0,0)" : localStorage.getItem("text-color"),
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        zIndex: 9999
      }}
    >
      {/*Quickview*/}
      {(mode === "quick" || (mode === "still" && isPlaying)) ? (
        <>
          {isPlaying && !alert && !chargingAlert && !bluetoothAlert ? (
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
                {alert === true ? <img src={lowBatteryIcon} alt="low battery" style={{ width: 40, height: 40, objectFit: 'contain', position: 'absolute', transform: 'translate(0%, -50%)' }} /> : chargingAlert ? <img src={chargingIcon} alt="charging" style={{ width: 40, height: 40, objectFit: 'contain', position: 'absolute', transform: 'translate(0%, -50%)' }} /> : bluetoothAlert ? "🎧" : (
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
                {alert === true ? `${percent}% ` : chargingAlert === true ? `${percent}% ` : standbyBorderEnabled ? "" : bluetoothAlert ? "Connected" : weather ? `${weather} º` : ""}
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
      {mode === 'large' && showArrows && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, pointerEvents: 'none' }}>
          {/* Left Side */}
          {((view === 'home') || (view === 'music') || (view === 'ai') || (view === 'todo') || (view === 'search') || (view === 'weather' && infiniteScroll)) && (
            <div
              className="nav-dest-zone left"
              onClick={() => {
                setPrevView(view);
                if (view === 'home') setView('search');
                else if (view === 'music') setView('home');
                else if (view === 'ai') setView('music');
                else if (view === 'todo') setView('ai');
                else if (view === 'search') setView('weather');
                else if (view === 'weather' && infiniteScroll) setView('todo');
              }}
              onMouseEnter={() => setHoveredNav('left')}
              onMouseLeave={() => setHoveredNav(null)}
              style={{
                position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                width: '40px', height: '60px', pointerEvents: 'auto', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: hoveredNav === 'left' ? 0.6 : 0, transition: 'opacity 0.2s ease'
              }}>
              {view === 'home' && <Search size={14} color={textColor} />}
              {view === 'music' && <Home size={14} color={textColor} />}
              {view === 'ai' && <Music size={14} color={textColor} />}
              {view === 'todo' && <MessageSquare size={14} color={textColor} />}
              {view === 'search' && <Cloud size={14} color={textColor} />}
              {view === 'weather' && infiniteScroll && <List size={14} color={textColor} />}
            </div>
          )}
          {/* Right Side */}
          {((view === 'home') || (view === 'search') || (view === 'music') || (view === 'ai') || (view === 'weather') || (view === 'todo' && infiniteScroll)) && (
            <div
              className="nav-dest-zone right"
              onClick={() => {
                setPrevView(view);
                if (view === 'home') setView('music');
                else if (view === 'search') setView('home');
                else if (view === 'music') setView('ai');
                else if (view === 'ai') setView('todo');
                else if (view === 'weather') setView('search');
                else if (view === 'todo' && infiniteScroll) setView('weather');
              }}
              onMouseEnter={() => setHoveredNav('right')}
              onMouseLeave={() => setHoveredNav(null)}
              style={{
                position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                width: '40px', height: '60px', pointerEvents: 'auto', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: hoveredNav === 'right' ? 0.6 : 0, transition: 'opacity 0.2s ease'
              }}>
              {view === 'home' && <Music size={14} color={textColor} />}
              {view === 'search' && <Home size={14} color={textColor} />}
              {view === 'music' && <MessageSquare size={14} color={textColor} />}
              {view === 'ai' && <List size={14} color={textColor} />}
              {view === 'weather' && <Search size={14} color={textColor} />}
              {view === 'todo' && infiniteScroll && <Cloud size={14} color={textColor} />}
            </div>
          )}
          {/* Bottom Area (Home -> Dropbox, or Expand for Weather/Todo/Search) */}
          {((view === 'home') || (view === 'weather') || (view === 'todo') || (view === 'search') || (view === 'weather_details') || (view === 'todo_timer') || (view === 'search_urls')) && (
            <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 20 }}>
              <div
                className="nav-dest-zone bottom-action"
                onClick={() => {
                  if (view === 'home') {
                    setPrevView(view);
                    setView('dropbox');
                  } else if (view === 'weather') {
                    setPrevView(view);
                    setView('weather_details');
                  } else if (view === 'todo') {
                    setPrevView(view);
                    setView('todo_timer');
                  } else if (view === 'search') {
                    setPrevView(view);
                    setView('search_urls');
                  } else if (view === 'weather_details') {
                    setPrevView(view);
                    setView('weather');
                  } else if (view === 'todo_timer') {
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
                {(view === 'home') && <Box size={14} color={textColor} />}
                {(view === 'weather' || view === 'todo' || view === 'search') && <ChevronDown size={14} color={textColor} />}
                {(view === 'weather_details' || view === 'todo_timer' || view === 'search_urls') && <ChevronUp size={14} color={textColor} />}
              </div>
            </div>
          )}
          {/* Top Area (Home -> Clipboard, or Return from Sub-views) */}
          {((view === 'home') || (view === 'weather_details') || (view === 'todo_timer') || (view === 'search_urls') || (view === 'dropbox')) && (
            <div
              className={`nav-dest-zone ${view === 'home' ? 'top-clipboard' : 'top-return'}`}
              onClick={() => {
                setPrevView(view);
                if (view === 'home') setView('clipboard');
                else if (view === 'weather_details') setView('weather');
                else if (view === 'todo_timer') setView('todo');
                else if (view === 'search_urls') setView('search');
                else if (view === 'dropbox') setView('home');
              }}
              onMouseEnter={() => setHoveredNav('top-area')}
              onMouseLeave={() => setHoveredNav(null)}
              style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: '60px', height: '30px', pointerEvents: 'auto', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: hoveredNav === 'top-area' ? 0.8 : (view === 'home' ? 0 : 0.3),
                transition: 'opacity 0.2s ease'
              }}>
              {view === 'home' ? <ClipboardIcon size={14} color={textColor} /> : <ChevronUp size={16} color={textColor} />}
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
      {view !== 'dropbox' && (
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
            textAlign: 'right'
          }}>
            <h1 style={{ fontSize: 12, margin: 0, lineHeight: 1, fontWeight: 600 }}>{time}</h1>
          </div>
        </div>
      )}

      {/* Main Content Area with Transitions */}
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>

        {/* Home View */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          opacity: view === 'home' && mode === 'large' ? 1 : 0,
          transform: view === 'home' && mode === 'large' ? 'translate(0, 0)' :
            view === 'search' ? 'translateX(100%)' :
              view === 'music' ? 'translateX(-100%)' :
                view === 'dropbox' ? 'translateY(-100%)' :
                  (prevView === 'search' && view === 'home') ? 'translateX(0)' :
                    (prevView === 'music' && view === 'home') ? 'translateX(0)' :
                      'translate(0,0)',
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: view === 'home' && mode === 'large' ? 'auto' : 'none',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>

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
            animation: shouldAnimateClock ? 'clockExpand 0.4s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
            transformOrigin: 'center center',
            marginTop: 10
          }}>
            <style>{`
                  @keyframes clockExpand {
                    0% { opacity: 0; transform: scale(0.8) translateY(10px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                  }
                `}</style>
            <h1 style={{ fontSize: 72, margin: 0, lineHeight: 1, fontWeight: 700, letterSpacing: -2 }}>{time}</h1>
            <h2 style={{ fontSize: 16, margin: '5px 0 0 0', opacity: 0.5, letterSpacing: 0.5, fontWeight: 500 }}>{formatDateShort()}</h2>
          </div>
        </div>
        {/* Music View Redesign */}
        <div style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          opacity: (view === 'music' && mode === 'large') ? 1 : 0,
          pointerEvents: (view === 'music' && mode === 'large') ? 'auto' : 'none',
          transform: (view === 'music' && mode === 'large') ? 'translate(0,0)' : view === 'home' ? 'translateX(100%)' : view === 'ai' ? 'translateX(-100%)' : 'none',
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
          transform: (view === 'weather' && mode === 'large') ? 'translate(0,0)' : (view === 'weather_details' ? 'translateY(-100%)' : 'translateX(-100%)'),
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
          transform: (view === 'weather_details' && mode === 'large') ? 'translate(0,0)' : 'translateY(100%)',
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
          transform: (view === 'search' && mode === 'large') ? 'translate(0,0)' : (view === 'search_urls' ? 'translateY(-100%)' : (view === 'weather' ? 'translateX(100%)' : 'translateX(-100%)')),
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <h2 style={{ fontSize: 18, marginBottom: 15, fontWeight: 700 }}>Search / URL</h2>
          <input
            autoFocus={view === 'search' && mode === 'large'}
            type="text"
            placeholder="Search Google or type URL..."
            style={{ width: '90%', padding: '12px 20px', borderRadius: 25, border: 'none', outline: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 16 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = e.target.value;
                if (!val) return;
                const url = val.includes('.') && !val.includes(' ') ? (val.startsWith('http') ? val : `https://${val}`) : `https://www.google.com/search?q=${encodeURIComponent(val)}`;
                window.electronAPI?.openExternal ? window.electronAPI.openExternal(url) : window.open(url, "_blank");
                setView('home');
              }
              if (e.key === 'Escape') setView('home');
            }}
          />
        </div>

        {/* Quick URLs View */}
        <div style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          opacity: (view === 'search_urls' && mode === 'large') ? 1 : 0,
          pointerEvents: (view === 'search_urls' && mode === 'large') ? 'auto' : 'none',
          transform: (view === 'search_urls' && mode === 'large') ? 'translate(0,0)' : 'translateY(100%)',
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
                  style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'rgba(74, 222, 128, 0.2)', color: '#4ade80', fontSize: 12, fontWeight: 700, textAlign: 'center', cursor: 'pointer' }}
                >
                  SAVE
                </div>
                <div 
                  onClick={() => {
                    setShowAddUrlModal(false);
                    setNewUrlData({ name: '', url: '' });
                    setEditingUrlIndex(null);
                  }}
                  style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 12, fontWeight: 700, textAlign: 'center', cursor: 'pointer' }}
                >
                  CANCEL
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Chat View */}
        <div style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          opacity: (view === 'ai' && mode === 'large') ? 1 : 0,
          pointerEvents: (view === 'ai' && mode === 'large') ? 'auto' : 'none',
          transform: (view === 'ai' && mode === 'large') ? 'translate(0,0)' : (view === 'todo' ? 'translateX(-100%)' : 'translateX(100%)'),
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
                     <div key={chat.id} style={{ 
                       marginBottom: 12, fontSize: 12, padding: 10, borderRadius: 10, 
                       background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)'
                     }}>
                       <div style={{ opacity: 0.5, fontSize: 10, marginBottom: 4 }}>{new Date(chat.timestamp).toLocaleString()}</div>
                       <div style={{ fontWeight: 600, marginBottom: 2 }}>Q: {chat.question}</div>
                       <div style={{ opacity: 0.8 }}>A: {chat.answer.substring(0, 100)}...</div>
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
          transform: (view === 'todo' && mode === 'large') ? 'translate(0,0)' : (view === 'todo_timer' ? 'translateY(-100%)' : 'translateX(100%)'),
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
                      border: `2px solid ${todo.completed ? '#4ade80' : 'rgba(255,255,255,0.2)'}`,
                      background: todo.completed ? '#4ade80' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}
                  >
                    {todo.completed && <Zap size={12} color="black" fill="black" />}
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

        {/* Todo Timer View */}
        <div style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          opacity: (view === 'todo_timer' && mode === 'large') ? 1 : 0,
          pointerEvents: (view === 'todo_timer' && mode === 'large') ? 'auto' : 'none',
          transform: (view === 'todo_timer' && mode === 'large') ? 'translate(0,0)' : 'translateY(100%)',
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15,
            padding: '10px 20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <TimerIcon size={18} color={textColor} opacity={0.7} />
              <span style={{ fontSize: 11, fontWeight: 800, opacity: 0.4, letterSpacing: 1.5 }}>TIMER</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div 
                onClick={() => setTimerSeconds(prev => Math.max(0, prev - 60))}
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
                onClick={() => setTimerSeconds(prev => prev + 60)}
                style={{ cursor: 'pointer', opacity: 0.3, transition: 'opacity 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.3'}
              >
                <ChevronUp size={20} color={textColor} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 20 }}>
              <div 
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                style={{ 
                  width: 40, height: 40, borderRadius: '50%', background: isTimerRunning ? 'rgba(239, 68, 68, 0.15)' : 'rgba(74, 222, 128, 0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {isTimerRunning ? <Pause size={20} color="#ef4444" /> : <Play size={20} color="#4ade80" style={{ transform: 'translateX(1px)' }} />}
              </div>
              
              <div 
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(0);
                }}
                style={{ 
                  width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
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
          transform: (view === 'dropbox' && mode === 'large') ? 'translate(0,0)' : 'translateY(100%)',
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
              style={{ flex: 1, border: `2px dashed ${isDraggingOver === 'copy' ? '#4ade80' : 'rgba(255,255,255,0.15)'}`, borderRadius: 15, display: 'flex', flexDirection: 'column', background: isDraggingOver === 'copy' ? 'rgba(74, 222, 128, 0.05)' : 'rgba(255,255,255,0.02)', transition: 'all 0.2s ease', overflow: 'hidden' }}>
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
                if (files.length > 0 && window.electronAPI?.moveToTemp) {
                  const paths = Array.from(files).map(f => window.electronAPI.getPathForFile(f));
                  await window.electronAPI.moveToTemp(paths);
                  refreshTempFiles();
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
          transform: (view === 'clipboard' && mode === 'large') ? 'translate(0,0)' : 'translateY(100%)',
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
                    transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden'
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
