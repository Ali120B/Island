import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Settings() {
    const [batteryAlerts, setBatteryAlerts] = useState(localStorage.getItem("battery-alerts") !== "false");
    const [islandBorder, setIslandBorder] = useState(localStorage.getItem("island-border") === "true");
    const [borderColor, setBorderColor] = useState(localStorage.getItem("island-border-color") || "#FAFAFA");
    const [borderThickness, setBorderThickness] = useState(Number(localStorage.getItem("island-border-thickness") || 1));
    const [borderStyle, setBorderStyle] = useState(localStorage.getItem("island-border-style") || "solid");
    const [openRouterKey, setOpenRouterKey] = useState(localStorage.getItem("openrouter-key") || "");
    const [autoRevertTime, setAutoRevertTime] = useState(Number(localStorage.getItem("auto-revert-time") || 5000));
    const [weatherUnit, setWeatherUnit] = useState(localStorage.getItem("weather-unit") || "f");
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "default");
    const [location, setLocation] = useState(localStorage.getItem("location") || "");
    const [bgColor, setBgColor] = useState(localStorage.getItem("bg-color") || "");
    const [textColor, setTextColor] = useState(localStorage.getItem("text-color") || "");
    const [bgImage, setBgImage] = useState(localStorage.getItem("bg-image") || "");
    const [hourFormat, setHourFormat] = useState(localStorage.getItem("hour-format") || "12-hr");
    const [standbyMode, setStandbyMode] = useState(localStorage.getItem("standby-mode") === "true");
    const [largeStandbyMode, setLargeStandbyMode] = useState(localStorage.getItem("large-standby-mode") === "true");
    const [hideInactive, setHideInactive] = useState(localStorage.getItem("hide-island-notactive") === "true");
    const [showArrows, setShowArrows] = useState(localStorage.getItem("show-nav-arrows") === "true");
    const [infiniteScroll, setInfiniteScroll] = useState(localStorage.getItem("infinite-scroll") === "true");
    const [opacity, setOpacity] = useState(Number(localStorage.getItem("island-opacity") || 0.64));
    const [fontSize, setFontSize] = useState(Number(localStorage.getItem("island-font-size") || 14));
    const [cornerRadius, setCornerRadius] = useState(Number(localStorage.getItem("island-corner-radius") || 25));
    const [islandPosition, setIslandPosition] = useState(Number(localStorage.getItem("island-position") || 20));
    const [aiModel, setAiModel] = useState(localStorage.getItem("ai-model") || "openai/gpt-3.5-turbo");
    const [customModel, setCustomModel] = useState(localStorage.getItem("custom-model") || "");
    const [showTimerBorder, setShowTimerBorder] = useState(localStorage.getItem("show-timer-border") !== "false");
    const [timerBorderColor, setTimerBorderColor] = useState(localStorage.getItem("timer-border-color") || "#FAFAFA");
    const [updateDownloaded, setUpdateDownloaded] = useState(false);

    useEffect(() => {
        if (window.electronAPI?.onUpdateDownloaded) {
            window.electronAPI.onUpdateDownloaded(() => {
                setUpdateDownloaded(true);
            });
        }
        
        // Check initial status
        const checkStatus = async () => {
            if (window.electronAPI?.getUpdateStatus) {
                const status = await window.electronAPI.getUpdateStatus();
                if (status) {
                    setUpdateDownloaded(true);
                }
            }
        };
        checkStatus();
    }, []);

    useEffect(() => {
        const loadRemoteSettings = async () => {
            if (window.electronAPI?.getSettings) {
                const remoteSettings = await window.electronAPI.getSettings();
                if (remoteSettings && Object.keys(remoteSettings).length > 0) {
                    // Update localStorage from remote settings first to ensure consistency
                    Object.entries(remoteSettings).forEach(([key, val]) => {
                        localStorage.setItem(key, val);
                    });

                    // Update UI state from remote
                    if (remoteSettings["battery-alerts"] !== undefined) setBatteryAlerts(remoteSettings["battery-alerts"] !== "false");
                    if (remoteSettings["island-border"] !== undefined) setIslandBorder(remoteSettings["island-border"] === "true");
                    if (remoteSettings["island-border-color"] !== undefined) setBorderColor(remoteSettings["island-border-color"]);
                    if (remoteSettings["island-border-thickness"] !== undefined) setBorderThickness(Number(remoteSettings["island-border-thickness"]));
                    if (remoteSettings["island-border-style"] !== undefined) setBorderStyle(remoteSettings["island-border-style"]);
                    if (remoteSettings["openrouter-key"] !== undefined) setOpenRouterKey(remoteSettings["openrouter-key"]);
                    if (remoteSettings["auto-revert-time"] !== undefined) setAutoRevertTime(Number(remoteSettings["auto-revert-time"]));
                    if (remoteSettings["weather-unit"] !== undefined) setWeatherUnit(remoteSettings["weather-unit"]);
                    if (remoteSettings["theme"] !== undefined) setTheme(remoteSettings["theme"]);
                    if (remoteSettings["location"] !== undefined) setLocation(remoteSettings["location"]);
                    if (remoteSettings["bg-color"] !== undefined) setBgColor(remoteSettings["bg-color"]);
                    if (remoteSettings["text-color"] !== undefined) setTextColor(remoteSettings["text-color"]);
                    if (remoteSettings["bg-image"] !== undefined) setBgImage(remoteSettings["bg-image"]);
                    if (remoteSettings["hour-format"] !== undefined) setHourFormat(remoteSettings["hour-format"]);
                    if (remoteSettings["standby-mode"] !== undefined) setStandbyMode(remoteSettings["standby-mode"] === "true");
                    if (remoteSettings["large-standby-mode"] !== undefined) setLargeStandbyMode(remoteSettings["large-standby-mode"] === "true");
                    if (remoteSettings["hide-island-notactive"] !== undefined) setHideInactive(remoteSettings["hide-island-notactive"] === "true");
                    if (remoteSettings["show-nav-arrows"] !== undefined) setShowArrows(remoteSettings["show-nav-arrows"] === "true");
                    if (remoteSettings["infinite-scroll"] !== undefined) setInfiniteScroll(remoteSettings["infinite-scroll"] === "true");
                    if (remoteSettings["island-opacity"] !== undefined) setOpacity(Number(remoteSettings["island-opacity"]));
                    if (remoteSettings["island-font-size"] !== undefined) setFontSize(Number(remoteSettings["island-font-size"]));
                    if (remoteSettings["island-corner-radius"] !== undefined) setCornerRadius(Number(remoteSettings["island-corner-radius"]));
                    if (remoteSettings["island-position"] !== undefined) setIslandPosition(Number(remoteSettings["island-position"]));
                    if (remoteSettings["ai-model"] !== undefined) setAiModel(remoteSettings["ai-model"]);
                    if (remoteSettings["custom-model"] !== undefined) setCustomModel(remoteSettings["custom-model"]);
                    if (remoteSettings["scroll-action"] !== undefined) setScrollAction(remoteSettings["scroll-action"]);
                    if (remoteSettings["show-timer-border"] !== undefined) setShowTimerBorder(remoteSettings["show-timer-border"] !== "false");
                    if (remoteSettings["timer-border-color"] !== undefined) setTimerBorderColor(remoteSettings["timer-border-color"]);
                }
            }
        };
        loadRemoteSettings();

        const handleBeforeUnload = () => {
            if (window.saveTimeout) {
                clearTimeout(window.saveTimeout);
                if (window.electronAPI?.saveSettings) {
                    const allSettings = { ...localStorage };
                    window.electronAPI.saveSettings(allSettings);
                }
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    const saveSetting = (key, value) => {
        // Convert boolean to string for localStorage consistency
        const stringValue = typeof value === 'boolean' ? String(value) : value;
        localStorage.setItem(key, stringValue);
        window.dispatchEvent(new Event('storage'));
        
        // Use a timeout to debounce saving to the file system
        if (window.saveTimeout) clearTimeout(window.saveTimeout);
        window.saveTimeout = setTimeout(() => {
            if (window.electronAPI?.saveSettings) {
                const allSettings = { ...localStorage };
                window.electronAPI.saveSettings(allSettings);
            }
        }, 500);
    };

    const handleSaveAll = () => {
        if (window.electronAPI?.saveSettings) {
            // Ensure all current state is in localStorage before saving
            const settingsToSave = {
                "battery-alerts": String(batteryAlerts),
                "island-border": String(islandBorder),
                "island-border-color": borderColor,
                "island-border-thickness": String(borderThickness),
                "island-border-style": borderStyle,
                "openrouter-key": openRouterKey,
                "auto-revert-time": String(autoRevertTime),
                "weather-unit": weatherUnit,
                "theme": theme,
                "location": location,
                "bg-color": bgColor,
                "text-color": textColor,
                "bg-image": bgImage,
                "hour-format": hourFormat,
                "standby-mode": String(standbyMode),
                "large-standby-mode": String(largeStandbyMode),
                "hide-island-notactive": String(hideInactive),
                "show-nav-arrows": String(showArrows),
                "infinite-scroll": String(infiniteScroll),
                "island-opacity": String(opacity),
                "island-font-size": String(fontSize),
                "island-corner-radius": String(cornerRadius),
                "island-position": String(islandPosition),
                "ai-model": aiModel,
                "custom-model": customModel,
                "scroll-action": scrollAction,
                "show-timer-border": String(showTimerBorder),
                "timer-border-color": timerBorderColor
            };

            // Update localStorage with current state values
            Object.entries(settingsToSave).forEach(([k, v]) => {
                localStorage.setItem(k, v);
            });

            // Dispatch storage event to notify other windows (Island.jsx) immediately
            window.dispatchEvent(new Event('storage'));

            window.electronAPI.saveSettings(settingsToSave);
        }
        
        // Show a brief feedback
        const btn = document.getElementById('save-all-btn');
        if (btn) {
            const originalText = btn.innerText;
            btn.innerText = 'Settings Applied!';
            btn.style.background = '#22c55e';
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.background = '#4facfe';
            }, 2000);
        }
    };

    if (!localStorage.getItem("infinite-scroll")) {
        localStorage.setItem("infinite-scroll", "false");
    }

    const handleResetAll = () => {
        if (window.confirm("Are you sure you want to reset all settings to default? This will clear all customizations.")) {
            localStorage.clear();
            // Also notify main process to clear saved settings file if possible, 
            // but reloading will trigger syncSettings which will see empty localStorage.
            window.location.reload();
        }
    };

    return (
        <div style={{
            padding: '30px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
            color: '#eee',
            backgroundColor: '#0a0a0a',
            minHeight: '100vh',
            width: '100%',
            overflowY: 'auto',
            boxSizing: 'border-box',
            scrollbarWidth: 'none'
        }}>
            {updateDownloaded && (
                <div style={{
                    background: '#ef4444',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontWeight: 600,
                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                    animation: 'slideDown 0.3s ease-out'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 14 }}>Update available! Restart now to install.</span>
                    </div>
                    <button
                        onClick={() => window.electronAPI?.quitAndInstall()}
                        style={{
                            background: 'white',
                            color: '#ef4444',
                            border: 'none',
                            padding: '6px 15px',
                            borderRadius: '8px',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Restart Now
                    </button>
                </div>
            )}
            <header style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>Island Settings</h1>
                    <p style={{ opacity: 0.5, fontSize: 13, marginTop: 5 }}>Customize your desktop experience</p>
                </div>
                <button 
                    id="save-all-btn"
                    onClick={handleSaveAll}
                    style={{
                        background: '#4facfe',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)'
                    }}
                >
                    Apply Settings
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 30 }}>
                {/* General Section */}
                <section style={{ background: '#141414', padding: 25, borderRadius: 20, border: '1px solid #222' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: 16, fontWeight: 600, color: '#4facfe', display: 'flex', alignItems: 'center', gap: 8 }}>
                        General
                    </h3>
                    
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, opacity: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>Location</label>
                        <input 
                            type="text" 
                            value={location} 
                            onChange={(e) => {
                                setLocation(e.target.value);
                                saveSetting("location", e.target.value);
                            }} 
                            placeholder="City, State" 
                            style={{ width: '100%', background: '#1f1f1f', border: '1px solid #333', borderRadius: 10, padding: '10px 15px', color: 'white', outline: 'none', fontSize: 14 }}
                        />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, opacity: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>Weather Unit</label>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {['f', 'c'].map(unit => (
                                <button
                                    key={unit}
                                    onClick={() => { setWeatherUnit(unit); saveSetting("weather-unit", unit); }}
                                    style={{
                                        flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                        background: weatherUnit === unit ? '#4facfe' : '#1f1f1f',
                                        color: weatherUnit === unit ? 'white' : '#777',
                                        fontWeight: 600, transition: 'all 0.2s'
                                    }}
                                >
                                    {unit === 'f' ? 'Fahrenheit' : 'Celsius'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: 0 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, opacity: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>Hour Format</label>
                        <div style={{ position: 'relative' }}>
                            <select 
                                value={hourFormat} 
                                onChange={(e) => { setHourFormat(e.target.value); saveSetting("hour-format", e.target.value); }}
                                style={{ 
                                    width: '100%', 
                                    appearance: 'none',
                                    background: '#1f1f1f', 
                                    border: '1px solid #333', 
                                    borderRadius: 10, 
                                    padding: '10px 15px', 
                                    color: 'white', 
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="12-hr" style={{ background: '#141414' }}>12-Hour (AM/PM)</option>
                                <option value="24-hr" style={{ background: '#141414' }}>24-Hour</option>
                            </select>
                            <ChevronDown size={16} style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} />
                        </div>
                    </div>
                </section>

                {/* AI Section */}
                <section style={{ background: '#141414', padding: 25, borderRadius: 20, border: '1px solid #222' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: 16, fontWeight: 600, color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 8 }}>
                        AI Intelligence
                    </h3>
                    
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, opacity: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>OpenRouter API Key</label>
                        <input 
                            type="password" 
                            value={openRouterKey} 
                            onChange={(e) => { setOpenRouterKey(e.target.value); saveSetting("openrouter-key", e.target.value); }} 
                            placeholder="sk-or-v1-..." 
                            style={{ width: '100%', background: '#1f1f1f', border: '1px solid #333', borderRadius: 10, padding: '10px 15px', color: 'white', outline: 'none' }}
                        />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, opacity: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>Model Selector</label>
                        <div style={{ position: 'relative' }}>
                            <select 
                                value={aiModel} 
                                onChange={(e) => { setAiModel(e.target.value); saveSetting("ai-model", e.target.value); }}
                                style={{ 
                                    width: '100%', 
                                    appearance: 'none',
                                    background: '#1f1f1f', 
                                    border: '1px solid #333', 
                                    borderRadius: 10, 
                                    padding: '10px 15px', 
                                    color: 'white', 
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <optgroup label="Free Models" style={{ background: '#141414' }}>
                                    <option value="google/gemini-2.0-flash-exp:free" style={{ background: '#141414' }}>Gemini 2.0 Flash Exp (Free)</option>
                                    <option value="google/gemini-2.0-pro-exp-02-05:free" style={{ background: '#141414' }}>Gemini 2.0 Pro Exp (Free)</option>
                                    <option value="meta-llama/llama-3.3-70b-instruct:free" style={{ background: '#141414' }}>Llama 3.3 70B (Free)</option>
                                    <option value="mistralai/mistral-7b-instruct:free" style={{ background: '#141414' }}>Mistral 7B (Free)</option>
                                    <option value="deepseek/deepseek-chat:free" style={{ background: '#141414' }}>DeepSeek Chat (Free)</option>
                                </optgroup>
                                <optgroup label="Standard Models" style={{ background: '#141414' }}>
                                    <option value="openai/gpt-4o" style={{ background: '#141414' }}>GPT-4o</option>
                                    <option value="anthropic/claude-3.5-sonnet" style={{ background: '#141414' }}>Claude 3.5 Sonnet</option>
                                    <option value="meta-llama/llama-3.1-405b" style={{ background: '#141414' }}>Llama 3.1 405B</option>
                                </optgroup>
                                <option value="custom" style={{ background: '#141414' }}>Custom Model ID</option>
                            </select>
                            <ChevronDown size={16} style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} />
                        </div>
                    </div>

                    {aiModel === 'custom' && (
                        <div style={{ marginBottom: 0 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, opacity: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>Custom Model ID</label>
                            <input 
                                type="text" 
                                value={customModel} 
                                onChange={(e) => { setCustomModel(e.target.value); saveSetting("custom-model", e.target.value); }} 
                                placeholder="author/model-id" 
                                style={{ width: '100%', background: '#1f1f1f', border: '1px solid #333', borderRadius: 10, padding: '10px 15px', color: 'white', outline: 'none' }}
                            />
                        </div>
                    )}
                </section>

                {/* Appearance Section */}
                <section style={{ background: '#141414', padding: 25, borderRadius: 20, border: '1px solid #222' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: 16, fontWeight: 600, color: '#f472b6', display: 'flex', alignItems: 'center', gap: 8 }}>
                        Appearance
                    </h3>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, opacity: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>Border Color</label>
                        <input
                            type="color"
                            value={borderColor}
                            onChange={(e) => { setBorderColor(e.target.value); saveSetting("island-border-color", e.target.value); }}
                            style={{ width: '100%', height: 40, background: '#1f1f1f', border: '1px solid #333', borderRadius: 10, padding: 6, cursor: 'pointer' }}
                        />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, opacity: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>
                            Border Thickness <span>{borderThickness}px</span>
                        </label>
                        <input
                            type="range" min="0" max="6" step="1"
                            value={borderThickness}
                            onChange={(e) => { const v = parseInt(e.target.value); setBorderThickness(v); saveSetting("island-border-thickness", v); }}
                            style={{ width: '100%', accentColor: '#f472b6' }}
                        />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, opacity: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>Border Style</label>
                        <select
                            value={borderStyle}
                            onChange={(e) => { setBorderStyle(e.target.value); saveSetting("island-border-style", e.target.value); }}
                            style={{ width: '100%', background: '#1f1f1f', border: '1px solid #333', borderRadius: 10, padding: '10px 15px', color: 'white', outline: 'none' }}
                        >
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                            <option value="dotted">Dotted</option>
                            <option value="double">Double</option>
                        </select>
                    </div>
                    
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, opacity: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>
                            Opacity <span>{Math.round(opacity * 100)}%</span>
                        </label>
                        <input 
                            type="range" min="0" max="1" step="0.01" 
                            value={opacity} 
                            onChange={(e) => { setOpacity(parseFloat(e.target.value)); saveSetting("island-opacity", parseFloat(e.target.value)); }}
                            style={{ width: '100%', accentColor: '#f472b6' }}
                        />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, opacity: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>
                            Corner Radius <span>{cornerRadius}px</span>
                        </label>
                        <input 
                            type="range" min="0" max="50" step="1" 
                            value={cornerRadius} 
                            onChange={(e) => { setCornerRadius(parseInt(e.target.value)); saveSetting("island-corner-radius", parseInt(e.target.value)); }}
                            style={{ width: '100%', accentColor: '#f472b6' }}
                        />
                    </div>

                    <div style={{ marginBottom: 0 }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, opacity: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>
                            Island Position <span>{islandPosition}px</span>
                        </label>
                        <input 
                            type="range" min="0" max="200" step="1" 
                            value={islandPosition} 
                            onChange={(e) => { setIslandPosition(parseInt(e.target.value)); saveSetting("island-position", parseInt(e.target.value)); }}
                            style={{ width: '100%', accentColor: '#f472b6' }}
                        />
                    </div>
                </section>

                {/* Features Section */}
                <section style={{ background: '#141414', padding: 25, borderRadius: 20, border: '1px solid #222' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: 16, fontWeight: 600, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 8 }}>
                        Features
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                        {[
                            { label: 'Battery Alerts', value: batteryAlerts, setter: setBatteryAlerts, key: 'battery-alerts' },
                            { label: 'Island Border', value: islandBorder, setter: setIslandBorder, key: 'island-border' },
                            { label: 'Standby Mode', value: standbyMode, setter: setStandbyMode, key: 'standby-mode' },
                            { label: 'Large Standby', value: largeStandbyMode, setter: setLargeStandbyMode, key: 'large-standby-mode' },
                            { label: 'Hide when Inactive', value: hideInactive, setter: setHideInactive, key: 'hide-island-notactive' },
                            { label: 'Show Nav Arrows', value: showArrows, setter: setShowArrows, key: 'show-nav-arrows' },
                            { label: 'Infinite Scrolling', value: infiniteScroll, setter: setInfiniteScroll, key: 'infinite-scroll' },
                            { label: 'Timer Progress Border', value: showTimerBorder, setter: setShowTimerBorder, key: 'show-timer-border' }
                        ].map(item => (
                            <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>
                                <div 
                                    onClick={() => { item.setter(!item.value); saveSetting(item.key, !item.value); }}
                                    style={{
                                        width: 44, height: 24, borderRadius: 12, background: item.value ? '#fbbf24' : '#333',
                                        position: 'relative', cursor: 'pointer', transition: 'all 0.3s'
                                    }}
                                >
                                    <div style={{
                                        width: 18, height: 18, borderRadius: '50%', background: 'white',
                                        position: 'absolute', top: 3, left: item.value ? 23 : 3, transition: 'all 0.3s'
                                    }} />
                                </div>
                            </div>
                        ))}
                        
                        <div style={{ marginTop: 10 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, opacity: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>Scroll Action</label>
                            <select 
                                value={scrollAction} 
                                onChange={(e) => { setScrollAction(e.target.value); saveSetting("scroll-action", e.target.value); }}
                                style={{ width: '100%', background: '#1f1f1f', border: '1px solid #333', borderRadius: 10, padding: '10px 15px', color: 'white', outline: 'none' }}
                            >
                                <option value="volume">Volume Control</option>
                                <option value="brightness">Brightness Control</option>
                            </select>
                        </div>

                        <div style={{ marginTop: 10 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, opacity: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>Timer Border Color</label>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                <input 
                                    type="color" 
                                    value={timerBorderColor} 
                                    onChange={(e) => { setTimerBorderColor(e.target.value); saveSetting("timer-border-color", e.target.value); }}
                                    style={{ width: 40, height: 40, padding: 0, border: 'none', borderRadius: 8, background: 'none', cursor: 'pointer' }}
                                />
                                <input 
                                    type="text" 
                                    value={timerBorderColor} 
                                    onChange={(e) => { setTimerBorderColor(e.target.value); saveSetting("timer-border-color", e.target.value); }}
                                    style={{ flex: 1, background: '#1f1f1f', border: '1px solid #333', borderRadius: 10, padding: '10px 15px', color: 'white', outline: 'none', fontSize: 14 }}
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            
            <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                <button 
                    onClick={() => window.electronAPI?.hideIsland?.()}
                    style={{
                        padding: '10px 20px',
                        background: 'rgba(255,255,255,0.06)',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '10px',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    }}
                >
                    Hide Island
                </button>

                <button 
                    onClick={() => window.electronAPI?.quitApp?.()}
                    style={{
                        padding: '10px 20px',
                        background: 'rgba(239, 68, 68, 0.14)',
                        color: '#fff',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: '10px',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.22)';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.35)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.14)';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)';
                    }}
                >
                    Quit App
                </button>

                <button 
                    onClick={handleResetAll}
                    style={{
                        padding: '10px 20px',
                        background: 'transparent',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '10px',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.borderColor = '#ef4444';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                    }}
                >
                    Reset All Settings
                </button>
            </div>
            
            <footer style={{ marginTop: 50, paddingBottom: 20, textAlign: 'center', opacity: 0.3, fontSize: 12 }}>
                Island Settings v2.3.3 • Press Ctrl+W to exit
            </footer>
        </div>
    );
}
