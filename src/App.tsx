import { AppProvider, useApp } from './contexts/AppContext';
import Sidebar from './components/Sidebar';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import EventSelectionScreen from './screens/EventSelectionScreen';
import DashboardScreen from './screens/DashboardScreen';
import ScannerScreen from './screens/ScannerScreen';
import ScanResultScreen from './screens/ScanResultScreen';
import ScanHistoryScreen from './screens/ScanHistoryScreen';
import ScanDetailScreen from './screens/ScanDetailScreen';
import AgentsScreen from './screens/AgentsScreen';
import AddAgentScreen from './screens/AddAgentScreen';
import ProfileScreen from './screens/ProfileScreen';
import StatisticsScreen from './screens/StatisticsScreen';
import SettingsScreen from './screens/SettingsScreen';
import OfflineModeScreen from './screens/OfflineModeScreen';
import SyncScreen from './screens/SyncScreen';
import ReportScreen from './screens/ReportScreen';
import ExportReportScreen from './screens/ExportReportScreen';
import HelpScreen from './screens/HelpScreen';
import TempCodeScreen from './screens/TempCodeScreen';
import { Screen } from './types';

const AUTH_SCREENS: Screen[] = ['splash', 'login', 'sv_events'];

function Router() {
  const { currentScreen } = useApp();

  const screens: Record<string, React.ReactNode> = {
    splash: <SplashScreen />,
    login: <LoginScreen />,
    events: <EventSelectionScreen />,
    dashboard: <DashboardScreen />,
    scanner: <ScannerScreen />,
    'scan-result': <ScanResultScreen />,
    history: <ScanHistoryScreen />,
    'scan-detail': <ScanDetailScreen />,
    agents: <AgentsScreen />,
    'add-agent': <AddAgentScreen />,
    profile: <ProfileScreen />,
    statistics: <StatisticsScreen />,
    settings: <SettingsScreen />,
    offline: <OfflineModeScreen />,
    sync: <SyncScreen />,
    report: <ReportScreen />,
    'export-report': <ExportReportScreen />,
    help: <HelpScreen />,
    'temp-code': <TempCodeScreen />,
  };

  const isAuth = AUTH_SCREENS.includes(currentScreen as Screen);
  const content = screens[currentScreen] ?? <DashboardScreen />;

  if (isAuth) {
    return (
      <div className="h-[100dvh] w-full bg-[#06030f] flex items-center justify-center">
        {/* Mobile: full screen. Desktop: centered card */}
        <div className="w-full md:max-w-md md:min-h-0 md:rounded-3xl md:shadow-2xl md:shadow-black/80 h-full md:h-auto md:max-h-[90dvh] bg-[#0d0a1a] flex flex-col overflow-hidden">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] w-full bg-[#06030f]">
      {/* Sidebar — hidden on mobile */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 flex flex-col h-full bg-[#0d0a1a] overflow-y-auto safe-pt safe-pl safe-pr">
        {content}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
