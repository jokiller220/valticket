import { useEffect, useState, useCallback } from 'react';
import { Users, Calendar, MapPin, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../lib/supabase';
import { ScanLog, TicketType } from '../types';
import BottomNav from '../components/BottomNav';

interface HourStat { hour: number; count: number; }

function timeAgo(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  return `${Math.floor(diff / 3600)}h`;
}

function ResultBadge({ result }: { result: string }) {
  if (result === 'valid') return <span className="text-xs text-green-400 font-medium bg-green-500/10 px-2 py-0.5 rounded-full">Valide</span>;
  if (result === 'already_scanned') return <span className="text-xs text-orange-400 font-medium bg-orange-500/10 px-2 py-0.5 rounded-full">Déjà scanné</span>;
  return <span className="text-xs text-red-400 font-medium bg-red-500/10 px-2 py-0.5 rounded-full">Invalide</span>;
}

export default function DashboardScreen() {
  const { currentEvent, isOffline, navigate } = useApp();
  const [totalScans, setTotalScans] = useState(0);
  const [recentLogs, setRecentLogs] = useState<ScanLog[]>([]);
  const [hourStats, setHourStats] = useState<HourStat[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!currentEvent) return;
    setLoading(true);
    try {
      const [scansRes, recentRes, typesRes] = await Promise.all([
        supabase.from('sv_scan_logs').select('id, result', { count: 'exact' }).eq('event_id', currentEvent.id).eq('result', 'valid'),
        supabase.from('sv_scan_logs').select('*, tickets:sv_purchases(*, ticket_types:sv_ticket_types(*))').eq('event_id', currentEvent.id).order('scanned_at', { ascending: false }).limit(8),
        supabase.from('sv_ticket_types').select('*').eq('event_id', currentEvent.id),
      ]);
      if (scansRes.count !== null) setTotalScans(scansRes.count);
      if (recentRes.data) setRecentLogs(recentRes.data as ScanLog[]);
      if (typesRes.data) setTicketTypes(typesRes.data);

      const since = new Date();
      since.setHours(since.getHours() - 8);
      const { data: hourData } = await supabase
        .from('sv_scan_logs')
        .select('scanned_at')
        .eq('event_id', currentEvent.id)
        .eq('result', 'valid')
        .gte('scanned_at', since.toISOString());

      if (hourData) {
        const counts: Record<number, number> = {};
        hourData.forEach(row => {
          const h = new Date(row.scanned_at).getHours();
          counts[h] = (counts[h] || 0) + 1;
        });
        const stats: HourStat[] = Array.from({ length: 9 }, (_, i) => {
          const h = (new Date().getHours() - 8 + i + 24) % 24;
          return { hour: h, count: counts[h] || 0 };
        });
        setHourStats(stats);
      }
    } finally {
      setLoading(false);
    }
  }, [currentEvent]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (!currentEvent) return null;

  const fillRate = currentEvent.capacity > 0 ? Math.round((totalScans / currentEvent.capacity) * 100) : 0;
  const maxHour = Math.max(...hourStats.map(h => h.count), 1);

  return (
    <div className="flex flex-col flex-1 bg-[#0d0a1a]">
      {/* Header */}
      <div className="px-5 md:px-8 lg:px-10 pt-6 md:pt-8 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={currentEvent.image_url || 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg'}
              alt={currentEvent.name}
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover"
            />
            <div className="min-w-0">
              <h2 className="text-white font-bold text-sm md:text-base truncate">{currentEvent.name}</h2>
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <Calendar size={10} />
                <span>{new Date(currentEvent.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                <span className="mx-1 hidden sm:inline">•</span>
                <MapPin size={10} className="hidden sm:inline" />
                <span className="hidden sm:inline">{currentEvent.venue}</span>
              </div>
            </div>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 text-xs font-medium transition-all hover:bg-purple-600/20"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 md:pb-6">
        <div className="px-5 md:px-8 lg:px-10 py-5 md:py-6">

          {/* Page title */}
          <h1 className="text-xl md:text-2xl font-bold text-white mb-5">Tableau de bord</h1>

          {/* Stats cards */}
          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {[
              { label: "Entrées aujourd'hui", value: loading ? '—' : totalScans.toLocaleString(), color: 'text-white', span: 'lg:col-span-2' },
              { label: 'Capacité', value: (currentEvent.total_capacity || currentEvent.capacity || 0).toLocaleString(), color: 'text-white', span: 'lg:col-span-2' },
              { label: "Taux d'entrée", value: `${fillRate}%`, color: fillRate > 80 ? 'text-green-400' : 'text-purple-400', span: 'lg:col-span-2' },
            ].map((s, i) => (
              <div key={i} className={`bg-[#1e1640] rounded-2xl p-4 md:p-5 flex flex-col gap-1 ${s.span}`}>
                <span className="text-gray-400 text-xs leading-tight">{s.label}</span>
                <span className={`text-2xl md:text-3xl font-black ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Main grid: charts + recent scans */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Left column: Charts */}
            <div className="flex flex-col gap-4">
              {/* Hourly chart */}
              <div className="bg-[#1e1640] rounded-2xl p-4 md:p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300 text-sm font-medium">Entrées par heure</span>
                  <Users size={14} className="text-purple-400" />
                </div>
                <div className="flex items-end gap-1.5 h-20 md:h-28">
                  {hourStats.length === 0
                    ? Array.from({ length: 9 }, (_, i) => (
                        <div key={i} className="flex-1 bg-purple-600/20 rounded-sm" style={{ height: '20%' }} />
                      ))
                    : hourStats.map((s, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full rounded-t bg-purple-600 transition-all"
                            style={{ height: `${Math.max((s.count / maxHour) * 100, 6)}%` }}
                          />
                          <span className="text-gray-500 text-[9px]">{s.hour}h</span>
                        </div>
                      ))
                  }
                </div>
              </div>

              {/* Ticket types legend */}
              {ticketTypes.length > 0 && (
                <div className="bg-[#1e1640] rounded-2xl p-4 md:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={14} className="text-purple-400" />
                    <span className="text-gray-300 text-sm font-medium">Catégories de billets</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {ticketTypes.map(tt => (
                      <div key={tt.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: tt.color }} />
                          <span className="text-gray-300 text-sm">{tt.name}</span>
                        </div>
                        <span className="text-gray-500 text-xs">{(tt.capacity || tt.quota || 0).toLocaleString()} places</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right column: Recent scans */}
            <div className="bg-[#1e1640] rounded-2xl p-4 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-300 text-sm font-medium">Derniers scans</h3>
                <button onClick={() => navigate('history')} className="text-purple-400 text-xs hover:text-purple-300 transition-colors">
                  Voir tout
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {loading ? (
                  Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
                  ))
                ) : recentLogs.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">Aucun scan récent</p>
                ) : (
                  recentLogs.map(log => (
                    <div key={log.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-300 text-xs font-bold shrink-0">
                        {log.agent_name?.charAt(0) || 'A'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{log.agent_name || 'Agent'}</p>
                        <p className="text-gray-500 text-xs truncate">{log.ticket_number_attempted || 'QR inconnu'}</p>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        <p className="text-gray-500 text-xs">{timeAgo(log.scanned_at)}</p>
                        <ResultBadge result={log.result} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isOffline && (
        <div className="mx-5 md:mx-8 mb-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-2">
          <AlertTriangle size={14} className="text-yellow-400" />
          <span className="text-yellow-400 text-xs">Mode hors-ligne actif — les données peuvent ne pas être à jour</span>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
