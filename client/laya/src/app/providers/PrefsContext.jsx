// context/PrefsContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const PrefsContext = createContext(null);

export function PrefsProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('laya_theme') || 
      (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'night' : 'warm');
  });

  const [dockOpen, setDockOpen] = useState(() => {
    const saved = localStorage.getItem('laya_dock_open');
    return saved !== null ? saved === 'true' : true;
  });

  const [hintDismissed, setHintDismissed] = useState(() => {
    return localStorage.getItem('laya_hint_dismissed') === 'true';
  });

  const [isListView, setIsListView] = useState(() => {
    return localStorage.getItem('laya_list_view') === 'true';
  });

  const [bearingHintEnabled, setBearingHintEnabled] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('laya_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'warm' ? 'night' : 'warm'));
  };

  const toggleDock = () => {
    setDockOpen(prev => {
      const next = !prev;
      localStorage.setItem('laya_dock_open', String(next));
      return next;
    });
  };

  const dismissHint = () => {
    setHintDismissed(true);
    localStorage.setItem('laya_hint_dismissed', 'true');
  };

  const toggleListView = () => {
    setIsListView(prev => {
      const next = !prev;
      localStorage.setItem('laya_list_view', String(next));
      return next;
    });
  };

  return (
    <PrefsContext.Provider
      value={{
        theme,
        toggleTheme,
        dockOpen,
        toggleDock,
        setDockOpen,
        hintDismissed,
        dismissHint,
        isListView,
        toggleListView,
        bearingHintEnabled,
        setBearingHintEnabled
      }}
    >
      {children}
    </PrefsContext.Provider>
  );
}

export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error('usePrefs must be used within PrefsProvider');
  return ctx;
}
