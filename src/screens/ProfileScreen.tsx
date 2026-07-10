import { ArrowLeft, Edit2, LogOut, Wifi, WifiOff, Settings, HelpCircle, FileText, Key } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import BottomNav from '../components/BottomNav';

export default function ProfileScreen() {
  const { currentAgent, currentEvent, navigate, setCurrentAgent, setCurrentEvent, isOffline, setIsOffline } = useApp();

  function handleLogout() {
    setCurrentAgent(null);
    setCurrentEvent(null);
    navigate('login');
  }

  if (!currentAgent) return null;

  const infoRows = [
    { label: 'Login', value: currentAgent.login_code },
    { label: 'Événement actuel', value: currentEvent?.name || '—' },
    { label: 'Rôle', value: currentAgent.role === 'supervisor' ? 'Superviseur de validation' : 'Agent de validation' },
    { label: 'Membre depuis', value: new Date(currentAgent.member_since).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) },
  ];

  const quickActions = [
    { icon: Settings, label: 'Paramètres', screen: 'settings' as const },
    { icon: HelpCircle, label: 'Aide', screen: 'help' as const },
    { icon: FileText, label: 'Rapport', screen: 'report' as const },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-full bg-[#0d0a1a]">
      {/* Header */}
      <div className="px-5 md:px-8 lg:px-10 pt-6 md:pt-8 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('dashboard')} className="md:hidden text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl md:text-2xl font-bold text-white">Mon profil</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-28 md:pb-6 after:content-[''] after:block after:h-28 md:after:h-6">
        <div className="px-5 md:px-8 lg:px-10 py-6">
          <div className="max-w-2xl mx-auto flex flex-col gap-5">

            {/* Avatar + name */}
            <div className="flex items-center gap-5 bg-[#1e1640] rounded-2xl p-5 border border-white/[0.04]">
              <div className="relative shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-900 flex items-center justify-center text-white text-2xl md:text-3xl font-black">
                  {currentAgent.avatar_initials || currentAgent.full_name.charAt(0)}
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center border-2 border-[#1e1640]">
                  <Edit2 size={12} className="text-white" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white text-lg md:text-xl font-bold truncate">{currentAgent.full_name}</h3>
                <p className="text-gray-400 text-sm">{currentAgent.role === 'supervisor' ? 'Superviseur' : 'Agent'} de validation</p>
                <p className="text-purple-400 text-xs font-mono mt-1">{currentAgent.login_code}</p>
              </div>
            </div>

            {/* Info rows */}
            <div className="bg-[#1e1640] rounded-2xl overflow-hidden border border-white/[0.04]">
              {infoRows.map((row, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 last:border-0">
                  <span className="text-gray-400 text-sm">{row.label}</span>
                  <span className="text-white text-sm font-medium max-w-[55%] text-right truncate">{row.value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  {isOffline ? <WifiOff size={14} className="text-yellow-400" /> : <Wifi size={14} className="text-green-400" />}
                  Mode hors-ligne
                </div>
                <button
                  onClick={async () => {
                    const nextState = !isOffline;
                    if (nextState && currentEvent && navigator.onLine) {
                      // Downloading before going offline
                      const { syncDown } = await import('../lib/sync');
                      await syncDown(currentEvent.id);
                    }
                    setIsOffline(nextState);
                  }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${isOffline ? 'bg-yellow-500' : 'bg-gray-700'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${isOffline ? 'translate-x-6' : ''}`} />
                </button>
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map(({ icon: Icon, label, screen }) => (
                <button
                  key={screen}
                  onClick={() => navigate(screen)}
                  className="flex items-center gap-3 bg-[#1e1640] rounded-2xl px-4 py-3.5 text-left border border-white/[0.04] hover:border-purple-500/30 hover:bg-[#261e50] transition-all"
                >
                  <Icon size={16} className="text-purple-400 shrink-0" />
                  <span className="text-gray-200 text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm transition-all active:scale-95 hover:bg-red-500/15"
            >
              <LogOut size={16} />
              Déconnexion
            </button>

            <p className="text-center text-gray-600 text-xs">Valticket v1.0.0</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
