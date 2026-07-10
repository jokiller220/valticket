import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../lib/supabase';

export default function AddAgentScreen() {
  const { currentEvent, goBack } = useApp();
  const [fullName, setFullName] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function genCode() {
    const num = Math.floor(Math.random() * 90) + 10;
    setLoginCode(`AGT-2025-${num}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (tempPassword !== confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (!currentEvent) { setError('Aucun événement sélectionné.'); return; }
    setLoading(true);
    try {
      const initials = fullName.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
      const { error: err } = await supabase.from('sv_agents').insert({
        full_name: fullName,
        login_code: loginCode.trim().toUpperCase(),
        temp_password: tempPassword,
        event_id: currentEvent.id,
        role: 'validator',
        avatar_initials: initials,
      });
      if (err) throw err;
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg.includes('unique') ? 'Ce code de connexion existe déjà.' : 'Erreur lors de la création.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col flex-1 bg-[#0d0a1a] items-center justify-center px-8 gap-6">
        <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
          <CheckCircle size={40} className="text-green-400" />
        </div>
        <div className="text-center">
          <h3 className="text-white text-xl font-bold">Agent créé !</h3>
          <p className="text-gray-400 text-sm mt-2 leading-relaxed">
            L'agent peut maintenant se connecter avec le code{' '}
            <span className="text-purple-400 font-mono font-bold">{loginCode}</span>
          </p>
        </div>
        <button onClick={goBack} className="w-full max-w-xs py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all">
          Retour aux agents
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-[#0d0a1a]">
      <div className="flex items-center gap-3 px-5 md:px-8 lg:px-10 pt-6 md:pt-8 pb-4 border-b border-white/[0.06]">
        <button onClick={goBack} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl md:text-2xl font-bold text-white">Ajouter un agent</h2>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        <form onSubmit={handleSubmit} className="px-5 md:px-8 lg:px-10 py-5 max-w-lg mx-auto flex flex-col gap-5">

          <div className="flex flex-col gap-2">
            <label className="text-gray-300 text-sm font-medium">Nom complet</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Jean Dupont"
              className="w-full px-4 py-3.5 rounded-xl bg-[#1e1640] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-300 text-sm font-medium">Login (code)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={loginCode}
                onChange={e => setLoginCode(e.target.value)}
                placeholder="AGT-2025-88"
                className="flex-1 px-4 py-3.5 rounded-xl bg-[#1e1640] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm font-mono"
                required
              />
              <button type="button" onClick={genCode} className="px-4 py-3 rounded-xl bg-purple-600/20 text-purple-400 text-xs font-medium hover:bg-purple-600/30 transition-colors">
                Générer
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-300 text-sm font-medium">Mot de passe temporaire</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={tempPassword}
                onChange={e => setTempPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3.5 rounded-xl bg-[#1e1640] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm pr-12"
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-300 text-sm font-medium">Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3.5 rounded-xl bg-[#1e1640] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm px-4 py-3 bg-red-500/10 rounded-xl border border-red-500/20">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-bold text-base transition-all active:scale-95"
          >
            {loading ? 'Enregistrement...' : "Enregistrer l'agent"}
          </button>
        </form>
      </div>
    </div>
  );
}
