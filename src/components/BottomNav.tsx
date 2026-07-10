import { LayoutDashboard, QrCode, Clock, User, BarChart2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Screen } from '../types';

const navItems: { icon: typeof LayoutDashboard; label: string; screen: Screen }[] = [
  { icon: LayoutDashboard, label: 'Tableau', screen: 'dashboard' },
  { icon: QrCode, label: 'Scanner', screen: 'scanner' },
  { icon: Clock, label: 'Historique', screen: 'history' },
  { icon: BarChart2, label: 'Stats', screen: 'statistics' },
  { icon: User, label: 'Profil', screen: 'profile' },
];

export default function BottomNav() {
  const { currentScreen, navigate } = useApp();

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-50 flex items-center justify-around bg-[#130e28] border-t border-white/10 pt-2 px-1 safe-pb">
      {navItems.map(({ icon: Icon, label, screen }) => {
        const active = currentScreen === screen;
        return (
          <button
            key={screen}
            onClick={() => navigate(screen)}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all"
          >
            <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-purple-600/30' : ''}`}>
              <Icon
                size={20}
                className={active ? 'text-purple-400' : 'text-gray-500'}
                strokeWidth={active ? 2.5 : 1.5}
              />
            </div>
            <span className={`text-[10px] font-medium ${active ? 'text-purple-400' : 'text-gray-500'}`}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
