import { useState } from 'react';
import { ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { syncUp, syncDown } from '../lib/sync';

export default function SyncScreen() {
  const { currentEvent, goBack, navigate } = useApp();
  const [progress, setProgress] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [done, setDone] = useState(false);

  async function startSync() {
    if (!currentEvent) return;
    setSyncing(true);
    setProgress(0);
    setDone(false);
    
    try {
      setProgress(25);
      await syncUp();
      setProgress(75);
      await syncDown(currentEvent.id);
      setProgress(100);
      setDone(true);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la synchronisation.');
    } finally {
      setSyncing(false);
    }
  }

  const stats = [
    { label: 'Scans synchronisés', value: done ? '35 / 35' : '24 / 35' },
    { label: 'Données téléchargées', value: '100%' },
    { label: 'Temps restant', value: done ? 'Terminé' : syncing ? '~15 sec' : '—' },
  ];

  const circumference = 2 * Math.PI * 45;
  const dashOffset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <div className="flex flex-col flex-1 bg-[#0d0a1a]">
      <div className="flex items-center gap-3 px-5 md:px-8 lg:px-10 pt-6 md:pt-8 pb-4 border-b border-white/[0.06]">
        <button onClick={goBack} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl md:text-2xl font-bold text-white">Synchronisation</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-8 py-10">
        <div className="max-w-sm w-full mx-auto flex flex-col items-center gap-8">
          {/* Circular progress */}
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#1e1640" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="45" fill="none"
                stroke={done ? '#22c55e' : '#7c3aed'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {done
                ? <CheckCircle size={44} className="text-green-400" />
                : (
                  <>
                    <span className="text-white text-3xl font-black">{Math.round(Math.min(progress, 100))}%</span>
                    {syncing && <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mt-1" />}
                  </>
                )
              }
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-white text-lg font-bold">
              {done ? 'Synchronisation terminée !' : syncing ? 'Synchronisation en cours...' : 'Prêt à synchroniser'}
            </h3>
            {!done && !syncing && (
              <p className="text-gray-400 text-sm mt-1">Ne fermez pas l'application pendant la sync.</p>
            )}
          </div>

          {/* Stats */}
          <div className="bg-[#1e1640] rounded-2xl overflow-hidden border border-white/[0.04] w-full">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 last:border-0">
                <span className="text-gray-400 text-sm">{stat.label}</span>
                <span className={`text-sm font-medium ${done ? 'text-green-400' : 'text-white'}`}>{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          {!syncing && !done && (
            <button
              onClick={startSync}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-base transition-all active:scale-95 w-full"
            >
              <RefreshCw size={18} />
              Synchroniser maintenant
            </button>
          )}
          {done && (
            <button
              onClick={() => navigate('dashboard')}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-bold text-base transition-all active:scale-95 w-full"
            >
              <CheckCircle size={18} />
              Retour au tableau de bord
            </button>
          )}
          {syncing && (
            <button onClick={goBack} className="w-full py-4 rounded-2xl bg-[#1e1640] border border-white/10 text-gray-400 text-sm font-medium hover:text-white transition-colors">
              Annuler
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
