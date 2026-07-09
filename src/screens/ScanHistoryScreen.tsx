import { useEffect, useState, useCallback } from 'react';
import { Filter, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../lib/supabase';
import { ScanLog } from '../types';
import BottomNav from '../components/BottomNav';

type FilterType = 'all' | 'valid' | 'already_scanned' | 'invalid';

function ResultBadge({ result }: { result: string }) {
  const map: Record<string, { cls: string; label: string; icon: React.ReactNode }> = {
    valid: { cls: 'text-green-400 bg-green-500/10', label: 'Valide', icon: <CheckCircle size={11} /> },
    already_scanned: { cls: 'text-orange-400 bg-orange-500/10', label: 'Déjà scanné', icon: <AlertTriangle size={11} /> },
    invalid: { cls: 'text-red-400 bg-red-500/10', label: 'Invalide', icon: <XCircle size={11} /> },
  };
  const cfg = map[result] || { cls: 'text-gray-400 bg-gray-500/10', label: result, icon: null };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.cls}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function ScanHistoryScreen() {
  const { currentEvent, navigate, setSelectedScanLogId } = useApp();
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    if (!currentEvent) return;
    setLoading(true);
    try {
      let query = supabase
        .from('sv_scan_logs')
        .select('*, tickets:sv_purchases(*, ticket_types:sv_ticket_types(*))')
        .eq('event_id', currentEvent.id)
        .order('scanned_at', { ascending: false })
        .limit(100);
      if (filter !== 'all') query = query.eq('result', filter);
      const { data } = await query;
      if (data) setLogs(data as ScanLog[]);
    } finally {
      setLoading(false);
    }
  }, [currentEvent, filter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filterTabs: { key: FilterType; label: string; count?: number }[] = [
    { key: 'all', label: 'Tous' },
    { key: 'valid', label: 'Valides' },
    { key: 'already_scanned', label: 'Déjà scannés' },
    { key: 'invalid', label: 'Invalides' },
  ];

  function handleLogClick(log: ScanLog) {
    setSelectedScanLogId(log.id);
    navigate('scan-detail');
  }

  return (
    <div className="flex flex-col min-h-full bg-[#0d0a1a]">
      {/* Header */}
      <div className="px-5 md:px-8 lg:px-10 pt-6 md:pt-8 pb-4 border-b border-white/[0.06]">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Historique des scans</h2>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all ${filter === tab.key ? 'bg-purple-600 text-white' : 'bg-[#1e1640] text-gray-400 border border-white/10 hover:border-purple-500/40 hover:text-gray-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 md:pb-6">
        <div className="px-5 md:px-8 lg:px-10 py-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-16 bg-[#1e1640] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <Filter size={40} className="text-gray-600" />
              <p className="text-gray-500 text-sm">Aucun scan trouvé</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {logs.map(log => (
                <button
                  key={log.id}
                  onClick={() => handleLogClick(log)}
                  className="flex items-center gap-3 bg-[#1e1640] rounded-xl px-4 py-3.5 text-left transition-all hover:bg-[#261e50] active:scale-[0.98] border border-transparent hover:border-purple-500/20"
                >
                  <div className="w-9 h-9 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-300 text-sm font-bold shrink-0">
                    {log.agent_name?.charAt(0) || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{log.agent_name || 'Agent'}</p>
                    <p className="text-gray-500 text-xs truncate">
                      {log.tickets?.ticket_types?.name ? `Entrée ${log.tickets.ticket_types.name}` : log.ticket_number_attempted || 'Inconnu'}
                    </p>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                    <span className="text-gray-500 text-xs">{formatDateTime(log.scanned_at)}</span>
                    <ResultBadge result={log.result} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
