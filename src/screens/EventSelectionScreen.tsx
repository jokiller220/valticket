import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, MapPin, RefreshCw, Users, CheckCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../lib/supabase';
import { Event } from '../types';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function EventSelectionScreen() {
  const { navigate, setCurrentEvent, currentAgent } = useApp();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  useEffect(() => { fetchEvents(); }, []);

  async function fetchEvents() {
    setLoading(true);
    try {
      const { data } = await supabase.from('sv_events').select('*').eq('is_published', true).order('date');
      if (data) setEvents(data);
      setLastSync(new Date());
    } finally {
      setLoading(false);
    }
  }

  function syncDiff() {
    const diff = Math.round((Date.now() - lastSync.getTime()) / 60000);
    return diff < 1 ? "à l'instant" : `il y a ${diff} min`;
  }

  function handleSelect(event: Event) {
    setCurrentEvent(event);
    navigate('dashboard');
  }

  return (
    <div className="flex flex-col flex-1 min-h-full bg-[#0d0a1a]">
      <div className="flex items-center gap-3 px-6 pt-8 pb-5">
        <button onClick={() => navigate('login')} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-white">Sélection de l'événement</h2>
          <p className="text-gray-400 text-xs">Choisissez l'événement à valider</p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-3 px-6 overflow-y-auto pb-4">
          {events.map(ev => {
            const isAssigned = currentAgent?.event_id === ev.id;
            return (
              <button
                key={ev.id}
                onClick={() => handleSelect(ev)}
                className={`flex gap-4 rounded-2xl overflow-hidden bg-[#1e1640] border transition-all active:scale-[0.98] hover:border-purple-500/40 ${isAssigned ? 'border-purple-500' : 'border-white/10'}`}
              >
                <img
                  src={ev.image_url || 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg'}
                  alt={ev.name}
                  className="w-24 h-24 object-cover shrink-0"
                />
                <div className="flex flex-col justify-center gap-1 text-left py-3 pr-4 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-sm leading-tight">{ev.title || ev.name}</h3>
                    {isAssigned && <CheckCircle size={14} className="text-purple-400 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <Calendar size={11} />
                    <span className="truncate">{formatDate(ev.date)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <MapPin size={11} />
                    <span>{ev.location || ev.venue}, {ev.city}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <Users size={11} />
                    <span>Capacité: {(ev.total_capacity || ev.capacity || 0).toLocaleString()}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="px-6 pb-6 pt-2">
        <button
          onClick={fetchEvents}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-purple-500/40 text-purple-400 text-sm font-medium transition-all hover:bg-purple-600/10 active:scale-95"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Synchroniser les données
        </button>
        <p className="text-center text-gray-500 text-xs mt-2">Dernière sync: {syncDiff()}</p>
      </div>
    </div>
  );
}
