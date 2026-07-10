import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Download, TrendingUp } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../lib/supabase';
import BottomNav from '../components/BottomNav';

export default function ReportScreen() {
  const { currentEvent, goBack, navigate } = useApp();
  const [totalValid, setTotalValid] = useState(0);
  const [totalAlready, setTotalAlready] = useState(0);
  const [totalInvalid, setTotalInvalid] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!currentEvent) return;
    setLoading(true);
    try {
      const [v, a, i] = await Promise.all([
        supabase.from('sv_scan_logs').select('id', { count: 'exact' }).eq('event_id', currentEvent.id).eq('result', 'valid'),
        supabase.from('sv_scan_logs').select('id', { count: 'exact' }).eq('event_id', currentEvent.id).eq('result', 'already_scanned'),
        supabase.from('sv_scan_logs').select('id', { count: 'exact' }).eq('event_id', currentEvent.id).eq('result', 'invalid'),
      ]);
      setTotalValid(v.count || 0);
      setTotalAlready(a.count || 0);
      setTotalInvalid(i.count || 0);
    } finally {
      setLoading(false);
    }
  }, [currentEvent]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (!currentEvent) return null;

  const fillRate = currentEvent.capacity > 0 ? Math.round((totalValid / currentEvent.capacity) * 100) : 0;
  const total = totalValid + totalAlready + totalInvalid;

  return (
    <div className="flex flex-col flex-1 bg-[#0d0a1a]">
      <div className="flex items-center gap-3 px-5 md:px-8 lg:px-10 pt-6 md:pt-8 pb-4 border-b border-white/[0.06]">
        <button onClick={goBack} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-lg md:text-xl font-bold text-white">Rapport d'événement</h2>
          <p className="text-gray-400 text-xs">{currentEvent.name}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 md:pb-6">
        <div className="px-5 md:px-8 lg:px-10 py-5 max-w-2xl mx-auto flex flex-col gap-4">

          <div className="flex items-center gap-3 bg-[#1e1640] rounded-2xl p-4 border border-white/[0.04]">
            <img
              src={currentEvent.image_url || 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg'}
              className="w-12 h-12 rounded-xl object-cover"
              alt=""
            />
            <div>
              <p className="text-white font-bold text-sm">{currentEvent.name}</p>
              <p className="text-gray-400 text-xs">
                {new Date(currentEvent.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Summary grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Entrées totales', value: loading ? '—' : totalValid.toLocaleString(), color: 'text-white' },
              { label: 'Capacité', value: (currentEvent.total_capacity || currentEvent.capacity || 0).toLocaleString(), color: 'text-white' },
              { label: "Taux", value: `${fillRate}%`, color: fillRate > 80 ? 'text-green-400' : 'text-purple-400' },
            ].map((s, i) => (
              <div key={i} className="bg-[#1e1640] rounded-2xl p-4 flex flex-col gap-1">
                <span className="text-gray-400 text-xs leading-tight">{s.label}</span>
                <span className={`text-xl font-black ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Jauge */}
          <div className="bg-[#1e1640] rounded-2xl p-5 md:p-6 mb-6">
            <h3 className="text-gray-300 text-sm font-medium mb-4">Progression globale</h3>
            <div className="h-4 bg-white/5 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-1000 rounded-full"
                style={{ width: `${fillRate}%` }}
              />
            </div>
            <p className="text-gray-500 text-xs mt-2">{totalValid.toLocaleString()} / {(currentEvent.total_capacity || currentEvent.capacity || 0).toLocaleString()} entrées validées</p>
          </div>

          {/* Detail breakdown */}
          <div className="bg-[#1e1640] rounded-2xl p-5 border border-white/[0.04]">
            <p className="text-gray-300 text-sm font-medium mb-4">Détails des scans</p>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Valides', value: totalValid, color: 'text-green-400', bg: 'bg-green-500', pct: total > 0 ? totalValid / total : 0 },
                { label: 'Déjà scannés', value: totalAlready, color: 'text-orange-400', bg: 'bg-orange-500', pct: total > 0 ? totalAlready / total : 0 },
                { label: 'Invalides', value: totalInvalid, color: 'text-red-400', bg: 'bg-red-500', pct: total > 0 ? totalInvalid / total : 0 },
              ].map((s, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-gray-400 text-sm">{s.label}</span>
                    <span className={`${s.color} font-bold text-sm`}>{loading ? '—' : s.value.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className={`h-full rounded-full ${s.bg} transition-all duration-700`} style={{ width: `${s.pct * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 md:px-8 lg:px-10 py-4 border-t border-white/[0.06]">
        <button
          onClick={() => navigate('export-report')}
          className="flex items-center justify-center gap-2 py-4 px-8 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-base transition-all active:scale-95 w-full md:w-auto"
        >
          <Download size={18} />
          Exporter en PDF
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
