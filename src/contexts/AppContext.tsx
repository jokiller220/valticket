import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Agent, Event, Screen, ScanResult } from '../types';
import { syncDown, syncUp, subscribeToRealtime, unsubscribeRealtime } from '../lib/sync';

interface AppContextValue {
  currentAgent: Agent | null;
  currentEvent: Event | null;
  isOffline: boolean;
  pendingSyncs: number;
  currentScreen: Screen;
  previousScreen: Screen | null;
  lastScanResult: ScanResult | null;
  selectedScanLogId: string | null;
  settings: AppSettings;
  setCurrentAgent: (agent: Agent | null) => void;
  setCurrentEvent: (event: Event | null) => void;
  setIsOffline: (v: boolean) => void;
  setPendingSyncs: (n: number) => void;
  navigate: (screen: Screen) => void;
  goBack: () => void;
  setLastScanResult: (r: ScanResult | null) => void;
  setSelectedScanLogId: (id: string | null) => void;
  updateSettings: (s: Partial<AppSettings>) => void;
}

interface AppSettings {
  autoSync: boolean;
  vibration: boolean;
  scanSound: boolean;
  darkMode: boolean;
}

const defaultSettings: AppSettings = {
  autoSync: true,
  vibration: true,
  scanSound: true,
  darkMode: true,
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(() => {
    try {
      const saved = localStorage.getItem('vt_agent') || sessionStorage.getItem('vt_agent');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [currentEvent, setCurrentEvent] = useState<Event | null>(() => {
    try {
      const saved = localStorage.getItem('vt_event') || sessionStorage.getItem('vt_event');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [isOffline, setIsOffline] = useState(false);
  const [pendingSyncs, setPendingSyncs] = useState(0);
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    try {
      const savedAgent = localStorage.getItem('vt_agent') || sessionStorage.getItem('vt_agent');
      if (savedAgent) {
        const savedEvent = localStorage.getItem('vt_event') || sessionStorage.getItem('vt_event');
        return savedEvent ? 'dashboard' : 'sv_events';
      }
    } catch { }
    return 'splash';
  });
  const [previousScreen, setPreviousScreen] = useState<Screen | null>(null);
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);
  const [selectedScanLogId, setSelectedScanLogId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('vt_settings');
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch { return defaultSettings; }
  });

  const navigate = useCallback((screen: Screen) => {
    setPreviousScreen(prev => {
      void prev;
      return currentScreen;
    });
    setCurrentScreen(screen);
  }, [currentScreen]);

  useEffect(() => {
    if (currentAgent) {
      if (localStorage.getItem('vt_agent_remember') === 'true') {
        localStorage.setItem('vt_agent', JSON.stringify(currentAgent));
      } else {
        sessionStorage.setItem('vt_agent', JSON.stringify(currentAgent));
      }
    } else {
      localStorage.removeItem('vt_agent');
      sessionStorage.removeItem('vt_agent');
    }
  }, [currentAgent]);

  useEffect(() => {
    if (currentEvent) {
      if (localStorage.getItem('vt_agent_remember') === 'true') {
        localStorage.setItem('vt_event', JSON.stringify(currentEvent));
      } else {
        sessionStorage.setItem('vt_event', JSON.stringify(currentEvent));
      }
    } else {
      localStorage.removeItem('vt_event');
      sessionStorage.removeItem('vt_event');
    }
  }, [currentEvent]);

  useEffect(() => {
    localStorage.setItem('vt_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    function handleOnline() {
      setIsOffline(false);
      if (settings.autoSync) {
        syncUp().catch(console.error);
      }
    }
    function handleOffline() {
      setIsOffline(true);
    }
    
    setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [settings.autoSync]);

  useEffect(() => {
    if (currentEvent) {
      if (navigator.onLine) {
        syncDown(currentEvent.id).catch(console.error);
        subscribeToRealtime(currentEvent.id);
      }
      
      const interval = setInterval(() => {
        if (navigator.onLine && settings.autoSync) {
          syncUp().catch(console.error);
        }
      }, 30000);
      
      return () => clearInterval(interval);
    } else {
      unsubscribeRealtime();
    }
  }, [currentEvent, settings.autoSync]);

  const goBack = useCallback(() => {
    if (previousScreen) {
      setCurrentScreen(previousScreen);
      setPreviousScreen(null);
    } else {
      setCurrentScreen('dashboard');
    }
  }, [previousScreen]);

  const updateSettings = useCallback((s: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...s }));
  }, []);

  return (
    <AppContext.Provider value={{
      currentAgent, currentEvent, isOffline, pendingSyncs,
      currentScreen, previousScreen, lastScanResult, selectedScanLogId, settings,
      setCurrentAgent, setCurrentEvent, setIsOffline, setPendingSyncs,
      navigate, goBack, setLastScanResult, setSelectedScanLogId, updateSettings,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
