import { useEffect } from 'react';
import { CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export default function SplashScreen() {
  const { navigate, isOffline, setIsOffline } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => navigate('login'), 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-between flex-1 bg-gradient-to-b from-[#1a0a3e] via-[#0d0a1a] to-[#0d0a1a] px-8 py-12">
      <div />

      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center shadow-2xl shadow-purple-900/60">
            <CheckCircle size={48} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="absolute -inset-1 rounded-3xl bg-purple-500/20 blur-xl -z-10" />
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-black text-white tracking-wider">VALTICKET</h1>
          <p className="text-purple-400 text-sm font-medium mt-1 tracking-widest uppercase">by SUMVIBE</p>
        </div>
        <p className="text-gray-400 text-base font-medium">Scannez. Validez. Contrôlez.</p>
      </div>

      <div className="flex flex-col items-center gap-6 w-full">
        <button
          onClick={() => navigate('login')}
          className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-base transition-all active:scale-95 shadow-lg shadow-purple-900/50"
        >
          Se connecter
        </button>

        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">Mode hors-ligne</span>
          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`relative w-12 h-6 rounded-full transition-colors ${isOffline ? 'bg-purple-600' : 'bg-gray-700'}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${isOffline ? 'translate-x-6' : ''}`} />
          </button>
          {isOffline ? <WifiOff size={16} className="text-yellow-500" /> : <Wifi size={16} className="text-gray-400" />}
        </div>
      </div>
    </div>
  );
}
