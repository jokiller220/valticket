import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Agent, Event, Screen, ScanResult } from '../types';

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
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [pendingSyncs, setPendingSyncs] = useState(0);
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [previousScreen, setPreviousScreen] = useState<Screen | null>(null);
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);
  const [selectedScanLogId, setSelectedScanLogId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  const navigate = useCallback((screen: Screen) => {
    setPreviousScreen(prev => {
      void prev;
      return currentScreen;
    });
    setCurrentScreen(screen);
  }, [currentScreen]);

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
