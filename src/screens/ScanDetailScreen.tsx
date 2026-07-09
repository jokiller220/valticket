import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, User, Tag, Hash, Calendar, CreditCard, Clock } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../lib/supabase';
import { ScanLog } from '../types';

function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <Icon size={14} />
        <span>{label}</span>
      </div>
      <span className="text-white text-sm font-medium max-w-[55%] text-right">{value}</span>
    </div>
  );
}

export default function ScanDetailScreen() {
  const { selectedScanLogId, goBack } = useApp();
  const [log, setLog] = useState<ScanLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedScanLogId) return;
    (async () => {
      try {
        const { data } = await supabase
          .from('scan_logs')
          .select('*, tickets(*, ticket_types(*))')
          .eq('id', selectedScanLogId)
          .maybeSingle();
        if (data) setLog(data as ScanLog);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedScanLogId]);

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-full bg-[#0d0a1a] items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!log) return null;

  const resultConfig = {
    valid: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', label: 'Valide', sub: 'Ce ticket est authentique.' },
    already_scanned: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', label: 'Déjà scanné', sub: 'Ticket utilisé précédemment.' },
    invalid: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Invalide', sub: "Ce ticket n'est pas valide." },
  }[log.result] || { icon: XCircle, color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20', label: 'Inconnu', sub: '' };

  const Icon = resultConfig.icon;

  return (
    <div className="flex flex-col min-h-full bg-[#0d0a1a]">
      <div className="flex items-center gap-3 px-5 md:px-8 lg:px-10 pt-6 md:pt-8 pb-4 border-b border-white/[0.06]">
        <button onClick={goBack} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg md:text-xl font-bold text-white">Détail du scan</h2>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="px-5 md:px-8 lg:px-10 py-5 max-w-2xl mx-auto flex flex-col gap-4">

          <div className={`flex flex-col items-center gap-3 border ${resultConfig.bg} rounded-2xl py-8`}>
            <Icon size={48} className={resultConfig.color} />
            <div className="text-center">
              <p className={`text-xl font-black ${resultConfig.color}`}>{resultConfig.label}</p>
              <p className="text-gray-400 text-sm">{resultConfig.sub}</p>
            </div>
            {log.result === 'valid' && log.tickets && (
              <div className="mt-2 bg-[#0d0a1a]/60 rounded-xl px-6 py-3 text-center">
                <p className="text-gray-400 text-xs">Numéro de billet</p>
                <p className="text-white font-mono text-sm font-bold">{log.tickets.ticket_number}</p>
              </div>
            )}
          </div>

          {log.tickets && (
            <div className="bg-[#1e1640] rounded-2xl p-5 border border-white/[0.04]">
              <InfoRow icon={User} label="Nom" value={log.tickets.buyer_name || 'Inconnu'} />
              <InfoRow icon={Tag} label="Type de billet" value={log.tickets.ticket_types?.name || '—'} />
              <InfoRow icon={Hash} label="Numéro de ticket" value={log.tickets.ticket_number} />
              <InfoRow icon={Calendar} label="Acheté le" value={formatDate(log.tickets.purchased_at)} />
              <InfoRow icon={CreditCard} label="Prix" value={`${log.tickets.price.toLocaleString()} FCFA`} />
              <InfoRow icon={Clock} label="Scanné le" value={formatDate(log.scanned_at)} />
              <InfoRow icon={User} label="Scanné par" value={log.agent_name || '—'} />
            </div>
          )}

          <button className="w-full py-3.5 rounded-2xl border border-white/10 text-gray-300 text-sm font-medium transition-all active:scale-95 hover:border-white/20 hover:text-white">
            Exporter le rapport
          </button>
        </div>
      </div>
    </div>
  );
}
