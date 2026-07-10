import { ArrowLeft, ChevronRight, Moon, Vibrate, Volume2, RefreshCw, HelpCircle, Info, LogOut } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import BottomNav from '../components/BottomNav';

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${value ? 'bg-purple-600' : 'bg-gray-700'}`}
    >
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${value ? 'translate-x-6' : ''}`} />
    </button>
  );
}

export default function SettingsScreen() {
  const { navigate, goBack, settings, updateSettings, setCurrentAgent, setCurrentEvent } = useApp();

  function handleLogout() {
    setCurrentAgent(null);
    setCurrentEvent(null);
    navigate('login');
  }

  return (
    <div className="flex flex-col flex-1 min-h-full bg-[#0d0a1a]">
      <div className="flex items-center gap-3 px-5 md:px-8 lg:px-10 pt-6 md:pt-8 pb-4 border-b border-white/[0.06]">
        <button onClick={goBack} className="md:hidden text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl md:text-2xl font-bold text-white">Paramètres</h2>
      </div>

      <div className="flex-1 overflow-y-auto pb-28 md:pb-6 after:content-[''] after:block after:h-28 md:after:h-6">
        <div className="px-5 md:px-8 lg:px-10 py-5 max-w-2xl mx-auto flex flex-col gap-5">

          <div>
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-2 px-1">Général</p>
            <div className="bg-[#1e1640] rounded-2xl overflow-hidden border border-white/[0.04]">
              {[
                { icon: RefreshCw, label: 'Synchronisation auto', key: 'autoSync' as const },
                { icon: Vibrate, label: 'Vibration', key: 'vibration' as const },
                { icon: Volume2, label: 'Son de scan', key: 'scanSound' as const },
              ].map(({ icon: Icon, label, key }) => (
                <div key={key} className="flex items-center justify-between px-5 py-4 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3 text-gray-200 text-sm">
                    <Icon size={16} className="text-purple-400" />
                    {label}
                  </div>
                  <Toggle value={settings[key]} onChange={() => updateSettings({ [key]: !settings[key] })} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-2 px-1">Apparence</p>
            <div className="bg-[#1e1640] rounded-2xl overflow-hidden border border-white/[0.04]">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3 text-gray-200 text-sm">
                  <Moon size={16} className="text-purple-400" />
                  Mode sombre
                </div>
                <Toggle value={settings.darkMode} onChange={() => updateSettings({ darkMode: !settings.darkMode })} />
              </div>
            </div>
          </div>

          <div>
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-2 px-1">Support</p>
            <div className="bg-[#1e1640] rounded-2xl overflow-hidden border border-white/[0.04]">
              <button onClick={() => navigate('help')} className="w-full flex items-center justify-between px-5 py-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 text-gray-200 text-sm">
                  <HelpCircle size={16} className="text-purple-400" />
                  Centre d'aide
                </div>
                <ChevronRight size={16} className="text-gray-500" />
              </button>
              <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 text-gray-200 text-sm">
                  <Info size={16} className="text-purple-400" />
                  À propos de Valticket v1.0.0
                </div>
                <ChevronRight size={16} className="text-gray-500" />
              </button>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm mt-2 transition-all active:scale-95 hover:bg-red-500/15"
          >
            <LogOut size={16} />
            Se déconnecter
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
