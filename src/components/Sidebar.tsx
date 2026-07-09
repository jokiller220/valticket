import { LayoutDashboard, QrCode, Clock, BarChart2, User, Users, Settings, HelpCircle, LogOut, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Screen } from '../types';

const mainNav: { icon: typeof LayoutDashboard; label: string; screen: Screen }[] = [
  { icon: LayoutDashboard, label: 'Tableau de bord', screen: 'dashboard' },
  { icon: QrCode, label: 'Scanner', screen: 'scanner' },
  { icon: Clock, label: 'Historique', screen: 'history' },
  { icon: BarChart2, label: 'Statistiques', screen: 'statistics' },
  { icon: Users, label: 'sv_agents', screen: 'sv_agents' },
];

const secondaryNav: { icon: typeof LayoutDashboard; label: string; screen: Screen }[] = [
  { icon: Settings, label: 'Paramètres', screen: 'settings' },
  { icon: HelpCircle, label: 'Aide', screen: 'help' },
  { icon: User, label: 'Mon profil', screen: 'profile' },
];

export default function Sidebar() {
  const { currentScreen, navigate, currentAgent, currentEvent, isOffline, setCurrentAgent, setCurrentEvent } = useApp();

  function handleLogout() {
    setCurrentAgent(null);
    setCurrentEvent(null);
    navigate('login');
  }

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-[#130e28] border-r border-white/[0.06] min-h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center shrink-0">
          <CheckCircle size={20} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-white font-black text-base tracking-wider leading-none">VALTICKET</p>
          <p className="text-purple-400 text-[10px] font-medium tracking-widest">by SUMVIBE</p>
        </div>
      </div>

      {/* Event badge */}
      {currentEvent && (
        <div className="mx-4 mt-4 mb-2 px-3 py-2.5 rounded-xl bg-purple-600/10 border border-purple-500/20">
          <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-0.5">Événement actif</p>
          <p className="text-white text-xs font-semibold truncate">{currentEvent.name}</p>
        </div>
      )}

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {mainNav.map(({ icon: Icon, label, screen }) => {
          const active = currentScreen === screen;
          return (
            <button
              key={screen}
              onClick={() => navigate(screen)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                active
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </button>
          );
        })}

        <div className="h-px bg-white/[0.06] my-2" />

        {secondaryNav.map(({ icon: Icon, label, screen }) => {
          const active = currentScreen === screen;
          return (
            <button
              key={screen}
              onClick={() => navigate(screen)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                active
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 flex flex-col gap-2 border-t border-white/[0.06] pt-4">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${isOffline ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'}`}>
          {isOffline ? <WifiOff size={13} /> : <Wifi size={13} />}
          {isOffline ? 'Hors-ligne' : 'Connecté'}
        </div>

        {currentAgent && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {currentAgent.avatar_initials || currentAgent.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{currentAgent.full_name}</p>
              <p className="text-gray-500 text-[10px] font-mono">{currentAgent.login_code}</p>
            </div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors shrink-0">
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
