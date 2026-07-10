import { useState } from 'react';
import { ArrowLeft, Copy, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export default function TempCodeScreen() {
  const { currentAgent, goBack } = useApp();
  const [copied, setCopied] = useState(false);
  const [validUntil] = useState(() => {
    const d = new Date();
    d.setHours(23, 59, 0, 0);
    return d;
  });

  if (!currentAgent) return null;

  function handleCopy() {
    navigator.clipboard.writeText(currentAgent!.login_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function formatDate(d: Date) {
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="flex flex-col flex-1 bg-[#0d0a1a]">
      <div className="flex items-center gap-3 px-5 md:px-8 lg:px-10 pt-6 md:pt-8 pb-4 border-b border-white/[0.06]">
        <button onClick={goBack} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl md:text-2xl font-bold text-white">Code temporaire</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="max-w-sm w-full mx-auto flex flex-col items-center gap-6">
          <p className="text-gray-400 text-sm text-center">
            Partagez ce code avec vos agents pour qu'ils puissent se connecter.
          </p>

          {/* Code display */}
          <div className="w-full bg-[#1e1640] rounded-3xl p-8 border border-white/[0.04] flex flex-col items-center gap-4">
            <div className="flex items-center justify-center flex-wrap gap-1">
              {currentAgent.login_code.split('').map((char, i) => (
                <span
                  key={i}
                  className={`text-4xl md:text-5xl font-black font-mono ${char === '-' ? 'text-gray-600' : 'text-white'}`}
                >
                  {char}
                </span>
              ))}
            </div>
            <div className="h-px w-full bg-white/10" />
            <p className="text-gray-400 text-xs text-center">
              Valide jusqu'au {formatDate(validUntil)}
            </p>
          </div>

          {/* Actions */}
          <div className="w-full flex flex-col gap-3">
            <button
              onClick={handleCopy}
              className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all active:scale-95 ${copied ? 'bg-green-600 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}
            >
              {copied ? <><CheckCircle size={18} />Code copié !</> : <><Copy size={18} />Copier le code</>}
            </button>
            <button className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#1e1640] border border-white/10 text-gray-300 font-medium transition-all active:scale-95 hover:border-white/20 hover:text-white">
              <RefreshCw size={16} />
              Régénérer le code
            </button>
          </div>

          <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 w-full">
            <AlertTriangle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-yellow-400 text-xs leading-relaxed">
              Attention : régénérer le code désactivera immédiatement le code précédent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
