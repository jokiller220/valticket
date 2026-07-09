import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const { navigate, setCurrentAgent, setCurrentEvent, isOffline, setIsOffline } = useApp();
  const [loginCode, setLoginCode] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (loginCode.includes('@')) {
        // Organizer login with Simmvibe credentials (email)
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: loginCode.trim(),
          password: password
        });

        if (authError) throw authError;

        if (authData.user) {
          setCurrentAgent({
            id: authData.user.id,
            full_name: 'Organisateur',
            login_code: loginCode,
            temp_password: password,
            event_id: null,
            role: 'supervisor',
            is_active: true,
            avatar_initials: 'OR',
            member_since: new Date().toISOString(),
            created_at: new Date().toISOString(),
          });
          navigate('sv_events');
          return;
        }
      }

      // Agent login (login code)
      const { data: agent, error: agentErr } = await supabase
        .from('sv_agents')
        .select('*, sv_events(*)')
        .eq('login_code', loginCode.trim().toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (agentErr) throw agentErr;
      if (!agent) {
        setError('Code de connexion ou mot de passe incorrect.');
        return;
      }
      if (agent.temp_password !== password) {
        setError('Code de connexion ou mot de passe incorrect.');
        return;
      }
      setCurrentAgent(agent);
      if (agent.sv_events) {
        setCurrentEvent(agent.sv_events);
        navigate('dashboard');
      } else {
        navigate('sv_events');
      }
    } catch {
      setError('Erreur de connexion. Vérifiez vos identifiants ou votre réseau.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-full bg-[#0d0a1a] px-6 py-8">
      <button onClick={() => navigate('splash')} className="w-8 h-8 flex items-center justify-center text-gray-400 mb-8">
        <ArrowLeft size={20} />
      </button>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Connexion Agent</h2>
        <p className="text-gray-400 text-sm mt-1">Entrez vos identifiants fournis par l'organisateur</p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-5 flex-1">
        <div className="flex flex-col gap-2">
          <label className="text-gray-300 text-sm font-medium">Login ou code</label>
          <input
            type="text"
            value={loginCode}
            onChange={e => setLoginCode(e.target.value)}
            placeholder="AGT-2025-78"
            className="w-full px-4 py-3.5 rounded-xl bg-[#1e1640] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-gray-300 text-sm font-medium">Mot de passe</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3.5 rounded-xl bg-[#1e1640] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm pr-12"
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setRememberMe(!rememberMe)}
            className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${rememberMe ? 'bg-purple-600 border-purple-600' : 'border-gray-600'}`}
          >
            {rememberMe && <span className="text-white text-xs">✓</span>}
          </button>
          <span className="text-gray-400 text-sm">Se souvenir de moi</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-bold text-base transition-all active:scale-95 mt-2"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>

        <div className="flex items-center justify-between mt-2">
          <span className="text-gray-400 text-sm">Mode hors-ligne</span>
          <button
            type="button"
            onClick={() => setIsOffline(!isOffline)}
            className={`relative w-12 h-6 rounded-full transition-colors ${isOffline ? 'bg-purple-600' : 'bg-gray-700'}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${isOffline ? 'translate-x-6' : ''}`} />
          </button>
          {isOffline ? <WifiOff size={16} className="text-yellow-500" /> : <Wifi size={16} className="text-gray-400" />}
        </div>

        <div className="mt-auto pt-4 text-center">
          <p className="text-gray-500 text-sm">
            Besoin d'aide ?{' '}
            <button type="button" onClick={() => navigate('help')} className="text-purple-400 underline">
              Contacter l'organisateur
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
