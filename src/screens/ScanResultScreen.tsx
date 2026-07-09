import { CheckCircle, XCircle, AlertTriangle, ArrowLeft, Clock, User, Tag, Hash, CreditCard, Calendar } from "lucide-react";
import { useApp } from "../contexts/AppContext";

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

export default function ScanResultScreen() {
  const { lastScanResult, navigate } = useApp();

  if (!lastScanResult) {
    navigate("scanner");
    return null;
  }

  const { result, ticket, scanLog, reason } = lastScanResult;

  const config = {
    valid: {
      icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30",
      label: "Ticket valide !", sub: "Entree autorisee", headerBg: "from-green-900/30 to-[#0d0a1a]",
    },
    already_scanned: {
      icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30",
      label: "Ticket deja scanne", sub: "Ce ticket a deja ete utilise.", headerBg: "from-orange-900/30 to-[#0d0a1a]",
    },
    invalid: {
      icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30",
      label: "Ticket invalide", sub: "Ce ticket n est pas valide.", headerBg: "from-red-900/30 to-[#0d0a1a]",
    },
  }[result];

  const Icon = config.icon;

  function formatDate(d: string | null | undefined) {
    if (!d) return "--";
    return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  const ticketTypeName = (ticket as any)?.ticket_types?.name || (ticket as any)?.sv_ticket_types?.name || "--";

  return (
    <div className="flex flex-col min-h-full bg-[#0d0a1a]">
      <div className={`bg-gradient-to-b ${config.headerBg} px-5 md:px-10 pt-8 pb-10`}>
        <button onClick={() => navigate("scanner")} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
          <ArrowLeft size={18} />
          <span className="text-sm">Retour au scanner</span>
        </button>
        <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
          <div className={`w-24 h-24 rounded-full ${config.bg} border-2 ${config.border} flex items-center justify-center shadow-2xl`}>
            <Icon size={52} className={config.color} />
          </div>
          <div className="text-center">
            <h2 className={`text-2xl font-black ${config.color}`}>{config.label}</h2>
            <p className="text-gray-400 text-sm mt-1">{config.sub}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 md:px-10 py-5 overflow-y-auto">
        <div className="max-w-lg mx-auto flex flex-col gap-4">
          {ticket ? (
            <div className="bg-[#1e1640] rounded-2xl p-5 border border-white/[0.04]">
              <InfoRow icon={Tag} label="Type de billet" value={ticketTypeName} />
              <InfoRow icon={Hash} label="Reference QR" value={ticket.qr_code || "--"} />
              <InfoRow icon={Calendar} label="Achete le" value={formatDate(ticket.created_at)} />
              <InfoRow icon={CreditCard} label="Prix" value={`${(ticket.total_amount || 0).toLocaleString()} FCFA`} />
              {result === "already_scanned" && scanLog && (
                <>
                  <InfoRow icon={Clock} label="Premiere entree" value={formatDate(scanLog.scanned_at)} />
                  <InfoRow icon={User} label="Scanne par" value={scanLog.agent_name || "--"} />
                </>
              )}
            </div>
          ) : result === "invalid" ? (
            <div className="bg-[#1e1640] rounded-2xl p-5 border border-white/[0.04]">
              <p className="text-gray-400 text-sm mb-1">Raison</p>
              <p className="text-white font-medium mb-4">{reason || "QR code non reconnu"}</p>
              <p className="text-gray-500 text-xs">Verifiez le ticket et reessayez.</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="px-5 md:px-10 py-5 flex flex-col md:flex-row gap-3 max-w-lg md:max-w-none mx-auto w-full border-t border-white/[0.06]">
        {result === "already_scanned" && (
          <button onClick={() => navigate("history")} className="flex-1 py-3.5 rounded-xl border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-colors">
            Verifier l historique
          </button>
        )}
        {(result === "already_scanned" || result === "invalid") && (
          <button onClick={() => alert("Alerte de fraude envoyee a l organisateur !")} className="flex-1 py-3.5 rounded-xl border border-red-500/40 text-red-400 bg-red-500/5 text-sm font-medium hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2">
            <AlertTriangle size={16} />
            Signaler (Alerte Fraude)
          </button>
        )}
        <button onClick={() => navigate("scanner")} className="flex-1 py-3.5 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 transition-colors active:scale-[0.98]">
          Scanner a nouveau
        </button>
      </div>
    </div>
  );
}
