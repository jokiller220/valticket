import { WifiOff, RefreshCw, ArrowLeft, CloudOff } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import BottomNav from '../components/BottomNav';

export default function OfflineModeScreen() {
  const { navigate, goBack, pendingSyncs } = useApp();

  return (
    <div className="flex flex-col min-h-full bg-[#0d0a1a]">
      <div className="flex items-center gap-3 px-5 md:px-8 lg:px-10 pt-6 md:pt-8 pb-4 border-b border-white/[0.06]">
        <button onClick={goBack} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl md:text-2xl font-bold text-white">Mode hors-ligne</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-8 py-10">
        <div className="max-w-sm w-full mx-auto flex flex-col items-center gap-8">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-gray-800/60 flex items-center justify-center">
              <WifiOff size={56} className="text-gray-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center">
              <CloudOff size={18} className="text-yellow-400" />
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-white text-xl font-bold mb-2">Vous êtes en mode hors-ligne</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Les scans sont enregistrés localement et synchronisés dès que la connexion sera rétablie.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-[#1e1640] rounded-2xl p-5 border border-white/[0.04]">
              <p className="text-gray-400 text-xs mb-1">Scans synchronisés</p>
              <p className="text-white text-2xl font-black">24 / 35</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5">
              <p className="text-yellow-400/70 text-xs mb-1">Scans en attente</p>
              <p className="text-yellow-400 text-2xl font-black">{pendingSyncs || 12}</p>
            </div>
          </div>

          <button
            onClick={() => navigate('sync')}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-base transition-all active:scale-95 w-full"
          >
            <RefreshCw size={18} />
            Synchroniser maintenant
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
