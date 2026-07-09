import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Plus, Users } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../lib/supabase';
import { Agent } from '../types';
import BottomNav from '../components/BottomNav';

export default function AgentsScreen() {
  const { currentEvent, navigate } = useApp();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = useCallback(async () => {
    if (!currentEvent) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('agents')
        .select('*')
        .eq('event_id', currentEvent.id)
        .order('created_at');
      if (data) setAgents(data);
    } finally {
      setLoading(false);
    }
  }, [currentEvent]);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  async function toggleAgent(agent: Agent) {
    await supabase.from('agents').update({ is_active: !agent.is_active }).eq('id', agent.id);
    fetchAgents();
  }

  const activeCount = agents.filter(a => a.is_active).length;

  return (
    <div className="flex flex-col min-h-full bg-[#0d0a1a]">
      {/* Header */}
      <div className="px-5 md:px-8 lg:px-10 pt-6 md:pt-8 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('dashboard')} className="md:hidden text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-white">Agents de l'événement</h2>
            {currentEvent && (
              <p className="text-gray-400 text-xs mt-0.5">{currentEvent.name}</p>
            )}
          </div>
          {currentEvent && (
            <img
              src={currentEvent.image_url || 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg'}
              className="w-10 h-10 rounded-xl object-cover"
              alt=""
            />
          )}
        </div>

        {/* Summary */}
        {!loading && (
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-gray-400 text-sm">
              <Users size={14} />
              <span>{agents.length} agents</span>
            </div>
            <span className="text-gray-600">•</span>
            <span className="text-green-400 text-sm">{activeCount} actifs</span>
            {agents.length - activeCount > 0 && (
              <>
                <span className="text-gray-600">•</span>
                <span className="text-gray-500 text-sm">{agents.length - activeCount} inactifs</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pb-32 md:pb-6">
        <div className="px-5 md:px-8 lg:px-10 py-5">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="h-20 bg-[#1e1640] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : agents.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <Users size={40} className="text-gray-600" />
              <p className="text-gray-500 text-sm">Aucun agent pour cet événement</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {agents.map(agent => (
                <div key={agent.id} className="flex items-center gap-4 bg-[#1e1640] rounded-2xl px-4 py-4 border border-white/[0.04] hover:border-white/10 transition-colors">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {agent.avatar_initials || agent.full_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{agent.full_name}</p>
                    <p className="text-gray-500 text-xs font-mono">{agent.login_code}</p>
                    <p className="text-gray-500 text-xs capitalize">{agent.role === 'supervisor' ? 'Superviseur' : 'Validateur'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${agent.is_active ? 'text-green-400 bg-green-500/10' : 'text-gray-500 bg-gray-500/10'}`}>
                      {agent.is_active ? 'Actif' : 'Inactif'}
                    </span>
                    <button
                      onClick={() => toggleAgent(agent)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${agent.is_active ? 'bg-purple-600' : 'bg-gray-700'}`}
                    >
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${agent.is_active ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-5 md:px-8 lg:px-10 pb-20 md:pb-6 pt-2 border-t border-white/[0.06]">
        <button
          onClick={() => navigate('add-agent')}
          className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all active:scale-95 md:w-auto w-full"
        >
          <Plus size={18} />
          Ajouter un agent
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
