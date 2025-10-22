"use client";

import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { setTheme, toggleFollowPlayer, setSelectedMatch } from '@/store/slices/teamSlice';
import { useLiveMatch } from '@/hooks/useLiveMatch';
import { usePlayerStats } from '@/hooks/usePlayerStats';
import { useClientSideLibs } from '@/utils/clientLibs';

/* ---------------------------------
   Mock data (replace with Firestore)
---------------------------------- */
const players = [
  { id: '1', name: 'Alex Quantum',  position: 'Forward',     img: 'https://picsum.photos/seed/player1/300/300.jpg', bio: 'Star forward with 24 goals this season.' },
  { id: '2', name: 'Sam Photon',    position: 'Midfielder',  img: 'https://picsum.photos/seed/player2/300/300.jpg', bio: 'Playmaker with 18 assists.' },
  { id: '3', name: 'Jordan Neutron',position: 'Defender',    img: 'https://picsum.photos/seed/player3/300/300.jpg', bio: 'Rock of the defence.' },
  { id: '4', name: 'Taylor Electron',position:'Goalkeeper',  img: 'https://picsum.photos/seed/player4/300/300.jpg', bio: 'Best keeper in the league.' },
];

const themes: Record<string, Record<string, string>> = {
  quantum: { primary: '#6a11cb', secondary: '#2575fc', accent: '#00d4ff' },
  crimson: { primary: '#990000', secondary: '#ffffff', accent: '#13294b' },
  neon:    { primary: '#ff416c', secondary: '#ff4b2b', accent: '#ffcc00' },
  cyber:   { primary: '#11998e', secondary: '#38ef7d', accent: '#00ffcc' },
};

export default function TeamPage() {
  const dispatch = useAppDispatch();
  const { theme, followedPlayers, selectedMatchId } = useAppSelector(s => s.team);
  const [playerModal, setPlayerModal] = useState<typeof players[0] | null>(null);
  const [droneModal, setDroneModal] = useState(false);

  /* real-time data */
  const liveMatch = useLiveMatch(selectedMatchId || 'match1'); // demo id
  const playerStats = usePlayerStats(playerModal?.id || '', selectedMatchId || undefined);

  /* init */
  const mounted = useClientSideLibs();

  /* theme css vars */
  useEffect(() => {
    const root = document.documentElement;
    const t = themes[theme];
    root.style.setProperty('--primary-color', t.primary);
    root.style.setProperty('--secondary-color', t.secondary);
    root.style.setProperty('--accent-color', t.accent);
  }, [theme]);

  /* parallax scroll */
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.pageYOffset;
      const parallax = document.getElementById('parallax-bg');
      if (parallax) parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* handlers */
  const toggleTheme = () => {
    const keys = Object.keys(themes);
    const idx = keys.indexOf(theme);
    dispatch(setTheme((keys[(idx + 1) % keys.length] as any)));
  };

  const follow = (id: string) => dispatch(toggleFollowPlayer(id));
  const isFollowed = (id: string) => followedPlayers.includes(id);

  return (
    <>
      {/* ------- HEADER ------- */}
      <header className="fixed top-0 w-full px-12 py-4 flex justify-between items-center z-50 backdrop-blur-md bg-black/70 text-white transition">
        <div className="logo flex items-center gap-2">
          <i className="fas fa-atom" />
          <span className="font-bold text-xl bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] bg-clip-text text-transparent">
            Quantum FC Live
          </span>
        </div>
        <nav>
          <ul className="flex gap-6">
            <li><a href="#team" className="relative hover:after:w-full after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-[var(--accent-color)] after:transition-all">Team</a></li>
            <li><a href="/fan-page" className="relative hover:after:w-full after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-[var(--accent-color)] after:transition-all">Fan Page</a></li>
          </ul>
        </nav>
        <div className="flex gap-3">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/10 transition"><i className="fas fa-moon" /></button>
          <button onClick={() => dispatch(setTheme('quantum'))} className="p-2 rounded-full hover:bg-white/10 transition"><i className="fas fa-palette" /></button>
        </div>
      </header>

      {/* ------- HERO ------- */}
      <section id="home" className="h-screen flex items-center justify-center relative mt-16 overflow-hidden">
        <div id="parallax-bg" className="absolute top-0 left-0 w-full h-[120%] bg-gradient-to-br from-[var(--primary-color)]/20 to-[var(--secondary-color)]/20 bg-cover bg-center -z-10 will-change-transform" />
        <div className="hero-content w-11/12 max-w-6xl text-center text-white">
          <h1 className="text-6xl mb-6 uppercase tracking-widest bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] bg-clip-text text-transparent animate-pulse">
            Harambee Starlets FC
          </h1>
          {/* Mini-slides */}
          <div className="flex gap-5 overflow-x-auto scroll-snap-x mandatory pb-4">
            <MiniCard title="Team Info" img="https://picsum.photos/seed/team/400/250">
              Founded in 2050, the most technologically advanced football team in the world.
            </MiniCard>
            <MiniCard title="Squad Form">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Last 5</span><span>W-W-D-W-L</span></div>
                <div className="flex justify-between"><span>Goals</span><span>12</span></div>
                <div className="flex justify-between"><span>Clean Sheets</span><span>2</span></div>
                <div className="flex justify-between"><span>Possession Avg</span><span>62%</span></div>
              </div>
            </MiniCard>
            <MiniCard title="Standings">
              <table className="w-full text-sm"><thead><tr className="border-b border-[var(--card-border)]"><th>Pos</th><th>Team</th><th>Pts</th></tr></thead>
                <tbody><tr><td>1</td><td>Quantum FC</td><td>78</td></tr><tr><td>2</td><td>Nexus United</td><td>72</td></tr><tr><td>3</td><td>Cyber City</td><td>68</td></tr></tbody>
              </table>
            </MiniCard>
            <MiniCard title="Season Trend">
              <div className="h-32 bg-gradient-to-t from-[var(--accent-color)]/30 to-transparent rounded" />
              <p className="text-xs opacity-80 mt-2">Upward trend with peak form in last 10 matches.</p>
            </MiniCard>
            <MiniCard title="Latest News">
              <div className="space-y-2 text-xs"><h4 className="text-sm">New Quantum Tech Stadium</h4><p>Revolutionary stadium with holographic displays opens next month.</p></div>
            </MiniCard>
          </div>
        </div>
      </section>

      {/* ------- TEAM SQUAD ------- */}
      <main className="px-12 py-20">
        <section id="team">
          <h2 className="text-4xl text-center mb-12 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:w-24 after:h-1 after:bg-[var(--accent-color)]">
            Team Squad
          </h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-8">
            {players.map(p => (
              <div
                key={p.id}
                onClick={() => setPlayerModal(p)}
                className="bg-[var(--card-bg)] backdrop-blur-sm border border-[var(--card-border)] rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(0,212,255,0.3)] transition"
              >
                <img src={p.img} alt={p.name} className="w-full h-64 object-cover" />
                <div className="p-5">
                  <h3 className="text-xl mb-1">{p.name}</h3>
                  <p className="text-[var(--accent-color)] mb-3">{p.position}</p>
                  <div className="flex justify-between text-sm">
                    <div className="text-center"><div className="font-bold text-lg">24</div><div className="opacity-70">Goals</div></div>
                    <div className="text-center"><div className="font-bold text-lg">12</div><div className="opacity-70">Assists</div></div>
                    <div className="text-center"><div className="font-bold text-lg">8.7</div><div className="opacity-70">Rating</div></div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); follow(p.id); }} className={`mt-3 w-full py-2 rounded ${isFollowed(p.id) ? 'bg-[var(--accent-color)] text-black' : 'bg-white/10 hover:bg-white/20'} transition`}>
                    {isFollowed(p.id) ? 'Following' : 'Follow'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ------- LIVE MATCH DYNAMICS ------- */}
        <section id="matches" className="mt-20">
          <h2 className="text-4xl text-center mb-12 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:w-24 after:h-1 after:bg-[var(--accent-color)]">
            Match Dynamics
          </h2>
          <button onClick={() => setDroneModal(true)} className="mx-auto block px-8 py-3 rounded-full bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] text-white font-bold hover:scale-105 transition shadow-lg">
            <i className="fas fa-drone mr-2" /> View Live Drone Dynamics
          </button>

          {/* Real-time widgets */}
          {liveMatch && (
            <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-white">
              <MetricCard label="Possession" value={`${liveMatch.possession.home}%`} />
              <MetricCard label="Shots" value={`${liveMatch.shots.home}`} />
              <MetricCard label="Pass Accuracy" value={`${liveMatch.passAccuracy.home}%`} />
              <MetricCard label="Attacks" value={`${liveMatch.attacks.home}`} />
            </div>
          )}
        </section>
      </main>

      

      {/* ------- MODALS ------- */}
      <Modal show={!!playerModal} onClose={() => setPlayerModal(null)}>
        {playerModal && (
          <div className="flex flex-col md:flex-row gap-6">
            <img src={playerModal.img} alt={playerModal.name} className="w-full md:w-72 rounded-xl object-cover" />
            <div>
              <h2 className="text-2xl">{playerModal.name}</h2>
              <p className="text-[var(--accent-color)] mb-3">{playerModal.position}</p>
              <p className="mb-4 opacity-80">{playerModal.bio}</p>
              {playerStats && (
                <div className="grid grid-cols-2 gap-3">
                  <StatBar label="Speed" value={90} />
                  <StatBar label="Strength" value={75} />
                  <StatBar label="Technique" value={95} />
                  <StatBar label="Intelligence" value={85} />
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal show={droneModal} onClose={() => setDroneModal(false)}>
        <div className="text-center">
          <h2 className="text-2xl mb-4">Live Drone Dynamics</h2>
          <div className="relative w-full h-96 bg-soccer-pitch bg-cover rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-black/30 flex flex-col justify-between p-4">
              <div className="flex justify-between">
                <button className="bg-white/10 backdrop-blur border border-white/20 px-3 py-1 rounded hover:bg-[var(--accent-color)] hover:text-black transition"><i className="fas fa-expand" /></button>
                <button className="bg-white/10 backdrop-blur border border-white/20 px-3 py-1 rounded hover:bg-[var(--accent-color)] hover:text-black transition"><i className="fas fa-camera" /></button>
                <button className="bg-white/10 backdrop-blur border border-white/20 px-3 py-1 rounded hover:bg-[var(--accent-color)] hover:text-black transition"><i className="fas fa-sync-alt" /></button>
              </div>
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-3 max-w-md mx-auto">
                <h3 className="mb-2">Match Analysis</h3>
                <div className="flex justify-around text-sm">
                  <div><div className="text-xl font-bold text-[var(--accent-color)]">62%</div><div className="opacity-70">Possession</div></div>
                  <div><div className="text-xl font-bold text-[var(--accent-color)]">15</div><div className="opacity-70">Shots</div></div>
                  <div><div className="text-xl font-bold text-[var(--accent-color)]">87%</div><div className="opacity-70">Pass Acc</div></div>
                  <div><div className="text-xl font-bold text-[var(--accent-color)]">42</div><div className="opacity-70">Attacks</div></div>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 opacity-80">Advanced drone technology provides real-time tactical analysis, player tracking, and performance metrics.</p>
        </div>
      </Modal>
    </>
  );
}

/* ---------------------------------
   Reusable UI pieces
----------------------------------- */
function MiniCard({ title, img, children }: { title: string; img?: string; children: React.ReactNode }) {
  return (
    <div className="flex-shrink-0 w-72 h-96 bg-[var(--card-bg)] backdrop-blur-sm border border-[var(--card-border)] rounded-2xl p-5 scroll-snap-start hover:-translate-y-2 transition">
      <h3 className="text-lg mb-3 text-[var(--accent-color)]">{title}</h3>
      {img && <img src={img} alt={title} className="w-full h-32 object-cover rounded mb-3" />}
      <div className="text-sm opacity-90">{children}</div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--card-bg)] backdrop-blur-sm border border-[var(--card-border)] rounded-xl p-4 text-center">
      <div className="text-2xl font-bold text-[var(--accent-color)]">{value}</div>
      <div className="text-sm opacity-70">{label}</div>
    </div>
  );
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <h4 className="mb-1 text-sm">{label}</h4>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)]" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Modal({ show, onClose, children }: { show: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div className="bg-[var(--bg-color)] text-[var(--text-color)] border border-[var(--card-border)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 animate-fadeIn" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl">&times;</button>
        {children}
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease; }
      `}</style>
    </div>
  );
}