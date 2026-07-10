import { useState } from 'react';
import { ArrowLeft, Search, ChevronDown, ChevronUp, Book, AlertCircle, Phone } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import BottomNav from '../components/BottomNav';

const faqs = [
  { q: 'Comment scanner un billet ?', a: "Allez dans l'onglet Scanner, pointez la caméra vers le QR code du billet. La validation est automatique dès que le code est détecté." },
  { q: 'Que faire en cas de ticket déjà scanné ?', a: "Un message orange apparaît avec l'heure du premier scan. Notez les informations et contactez votre superviseur en cas de litige." },
  { q: 'Comment fonctionne le mode hors-ligne ?', a: 'Les scans sont enregistrés localement et synchronisés dès que la connexion revient. Le compteur de scans en attente s\'affiche dans le tableau de bord.' },
  { q: 'Je ne vois pas la caméra, que faire ?', a: 'Allez dans les paramètres de votre navigateur et autorisez l\'accès à la caméra pour cette application. Rechargez ensuite la page.' },
  { q: 'Comment exporter un rapport ?', a: 'Dans le menu profil > Rapport d\'événement > Exporter. Vous pouvez choisir le format PDF, Excel ou CSV.' },
  { q: 'Comment ajouter un nouvel agent ?', a: 'Allez dans la section Agents, puis cliquez sur "Ajouter un agent". Renseignez le nom, le code de connexion et le mot de passe temporaire.' },
];

export default function HelpScreen() {
  const { goBack } = useApp();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = faqs.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  const links = [
    { icon: Book, label: "Guide d'utilisation", color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { icon: AlertCircle, label: 'Résolution des problèmes', color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { icon: Phone, label: 'Contacter le support', color: 'text-green-400', bg: 'bg-green-500/10' },
  ];

  return (
    <div className="flex flex-col flex-1 bg-[#0d0a1a]">
      <div className="flex items-center gap-3 px-5 md:px-8 lg:px-10 pt-6 md:pt-8 pb-4 border-b border-white/[0.06]">
        <button onClick={goBack} className="md:hidden text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl md:text-2xl font-bold text-white">Aide &amp; Support</h2>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 md:pb-6">
        <div className="px-5 md:px-8 lg:px-10 py-5 max-w-2xl mx-auto flex flex-col gap-5">

          {/* Search */}
          <div className="flex items-center gap-3 bg-[#1e1640] rounded-xl px-4 py-3 border border-white/10 focus-within:border-purple-500/40 transition-colors">
            <Search size={16} className="text-gray-500 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher dans l'aide..."
              className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-gray-500"
            />
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {links.map(({ icon: Icon, label, color, bg }) => (
              <button key={label} className={`flex items-center gap-3 ${bg} rounded-xl px-4 py-3.5 text-left hover:opacity-80 transition-opacity`}>
                <div className={`w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0`}>
                  <Icon size={16} className={color} />
                </div>
                <span className="text-gray-200 text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>

          {/* FAQ */}
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">Questions fréquentes</p>
            <div className="flex flex-col gap-2">
              {filtered.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">Aucun résultat pour "{search}"</p>
              ) : filtered.map((faq, i) => (
                <div key={i} className="bg-[#1e1640] rounded-xl overflow-hidden border border-white/[0.04]">
                  <button
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="text-gray-200 text-sm font-medium flex-1 pr-3">{faq.q}</span>
                    {expanded === i
                      ? <ChevronUp size={16} className="text-purple-400 shrink-0" />
                      : <ChevronDown size={16} className="text-gray-500 shrink-0" />
                    }
                  </button>
                  {expanded === i && (
                    <div className="px-5 pb-4">
                      <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
