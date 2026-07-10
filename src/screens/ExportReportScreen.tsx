import { useState } from 'react';
import { ArrowLeft, FileText, Table, File, Download, CheckCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

type Format = 'pdf' | 'excel' | 'csv';
type Period = 'today' | 'week' | 'custom';

export default function ExportReportScreen() {
  const { goBack } = useApp();
  const [format, setFormat] = useState<Format>('pdf');
  const [period, setPeriod] = useState<Period>('today');
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  function handleExport() {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    }, 2000);
  }

  const formats: { key: Format; label: string; icon: typeof FileText; desc: string }[] = [
    { key: 'pdf', label: 'PDF', icon: FileText, desc: 'Rapport formaté, prêt à imprimer' },
    { key: 'excel', label: 'Excel', icon: Table, desc: 'Données brutes et tableaux' },
    { key: 'csv', label: 'CSV', desc: 'Format universel pour analyse', icon: File },
  ];

  const periods: { key: Period; label: string }[] = [
    { key: 'today', label: "Aujourd'hui" },
    { key: 'week', label: '7 derniers jours' },
    { key: 'custom', label: 'Personnalisée' },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-full bg-[#0d0a1a]">
      <div className="flex items-center gap-3 px-5 md:px-8 lg:px-10 pt-6 md:pt-8 pb-4 border-b border-white/[0.06]">
        <button onClick={goBack} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl md:text-2xl font-bold text-white">Exporter rapport</h2>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="px-5 md:px-8 lg:px-10 py-5 max-w-lg mx-auto flex flex-col gap-6">

          <div>
            <p className="text-gray-400 text-sm mb-3 font-medium">Format d'export</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {formats.map(({ key, label, icon: Icon, desc }) => (
                <button
                  key={key}
                  onClick={() => setFormat(key)}
                  className={`flex flex-col items-start gap-2 p-4 rounded-2xl border transition-all text-left ${format === key ? 'bg-purple-600/10 border-purple-500/40' : 'bg-[#1e1640] border-white/[0.04] hover:border-white/20'}`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${format === key ? 'border-purple-500' : 'border-gray-600'}`}>
                      {format === key && <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />}
                    </div>
                    <Icon size={16} className={format === key ? 'text-purple-400' : 'text-gray-500'} />
                    <span className={`text-sm font-bold ${format === key ? 'text-white' : 'text-gray-300'}`}>{label}</span>
                  </div>
                  <p className="text-gray-500 text-xs leading-snug">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-gray-400 text-sm mb-3 font-medium">Période</p>
            <div className="bg-[#1e1640] rounded-2xl overflow-hidden border border-white/[0.04]">
              {periods.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setPeriod(key)}
                  className={`w-full flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0 transition-colors ${period === key ? 'bg-purple-600/10' : 'hover:bg-white/5'}`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${period === key ? 'border-purple-500' : 'border-gray-600'}`}>
                    {period === key && <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />}
                  </div>
                  <span className={`text-sm ${period === key ? 'text-white font-medium' : 'text-gray-300'}`}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting || exported}
            className={`flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold text-base transition-all active:scale-95 ${exported ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-500 disabled:opacity-60'}`}
          >
            {exported
              ? <><CheckCircle size={18} />Exporté !</>
              : exporting
              ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Exportation...</>
              : <><Download size={18} />Exporter</>
            }
          </button>
        </div>
      </div>

      <p className="text-center text-gray-600 text-xs pb-4">Valticket v1.0.0</p>
    </div>
  );
}
