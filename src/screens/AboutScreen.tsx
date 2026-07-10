import { ArrowLeft, CheckCircle, Info } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export default function AboutScreen() {
  const { goBack } = useApp();

  return (
    <div className="flex flex-col flex-1 min-h-full bg-[#0d0a1a]">
      <div className="flex items-center gap-3 px-5 md:px-8 lg:px-10 pt-6 md:pt-8 pb-4 border-b border-white/[0.06]">
        <button onClick={goBack} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl md:text-2xl font-bold text-white">À propos</h2>
      </div>

      <div className="flex-1 overflow-y-auto pb-28 md:pb-6 after:content-[''] after:block after:h-28 md:after:h-6">
        <div className="px-5 md:px-8 lg:px-10 py-8 max-w-2xl mx-auto flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center shadow-2xl shadow-purple-900/60">
              <CheckCircle size={48} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="absolute -inset-1 rounded-3xl bg-purple-500/20 blur-xl -z-10" />
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-black text-white tracking-wider">VALTICKET</h1>
            <p className="text-purple-400 text-xs font-bold mt-1 tracking-widest uppercase">Version 1.0.0</p>
          </div>

          <div className="w-full bg-[#1e1640] rounded-2xl p-6 border border-white/[0.04] text-center mt-4">
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Valticket est la solution officielle de Sumvibe pour le contrôle d'accès et la gestion d'événements. 
              Conçue pour être rapide, fiable et fonctionner même hors-ligne.
            </p>
            <p className="text-gray-400 text-xs mt-6">
              © {new Date().getFullYear()} Sumvibe. Tous droits réservés.
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
