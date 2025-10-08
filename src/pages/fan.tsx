"use client"; // <-- remove if you use Pages Router

import { useEffect, useState, FormEvent } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { fetchGames } from '@/store/adminThunk';
import { fetchMerch } from '@/store/adminThunk';
import { fetchFanData, followTeam, buyTicket } from '@/store/fanThunk';
import AOS from 'aos';
import 'aos/dist/aos.css';
import feather from 'feather-icons';
import FanGuard from '@/guards/FanGuard';
import { ChatMessage } from '@/services/firestoreFan';
import UserHeader from '@/components/UserHeader';

/* ---------- types ---------- */
type TeamTheme = 'crimson' | 'blue' | 'cardinal' | 'gold';

/* ---------- styles ---------- */
const themes: Record<TeamTheme, Record<string, string>> = {
  crimson: { primary: '#990000', secondary: '#ffffff', accent: '#13294b' },
  blue:    { primary: '#003366', secondary: '#ffffff', accent: '#990000' },
  cardinal:{ primary: '#8C1515', secondary: '#ffffff', accent: '#4D4D4D' },
  gold:    { primary: '#FFB81C', secondary: '#000000', accent: '#00539B' },
};

export default function FanPage() {
  const dispatch = useAppDispatch();
  const user        = useAppSelector(s => s.auth.user);
  const { followedTeams, myTickets, newsFeed } = useAppSelector(s => s.fan);
  const merch = useAppSelector(s => s.merch.items);
  const { upcoming } = useAppSelector(s => s.games);

  /* ---------- local state ---------- */
  const [theme, setTheme] = useState<TeamTheme>('crimson');
  const [chatMsg, setChatMsg]     = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const selectedFixture = upcoming[0]; // demo: first upcoming game

  /* ---------- init ---------- */
  useEffect(() => {
    AOS.init({ once: true });
    feather.replace();
    dispatch(fetchGames());
    dispatch(fetchMerch());
    dispatch(fetchFanData(user!.uid));
    subscribeChat();
  }, [dispatch, user]);

  /* ---------- theme css vars ---------- */
  useEffect(() => {
    const root = document.documentElement;
    const t = themes[theme];
    root.style.setProperty('--primary-color', t.primary);
    root.style.setProperty('--secondary-color', t.secondary);
    root.style.setProperty('--accent-color', t.accent);
    root.className = `theme-${theme}`;
  }, [theme]);

  /* ---------- real-time chat ---------- */
  const subscribeChat = () => {
    if (!selectedFixture?.id) return;
    import('@/services/firestoreFan').then(({ subscribeFanChat }) => {
      subscribeFanChat(selectedFixture.id, (msgs) => setChatMessages(msgs));
    });
  };

  /* ---------- handlers ---------- */
  const sendChat = (e: FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim() || !selectedFixture?.id) return;
    import('@/services/firestoreFan').then(({ sendFanChatMessage }) => {
      sendFanChatMessage(selectedFixture.id, user!.uid, user!.displayName || 'Fan', chatMsg);
      setChatMsg('');
    });
  };

  const follow = (teamId: string) => dispatch(followTeam(teamId));
  const buyTix = (fixtureId: string) => {
    const seat = prompt('Preferred seat (e.g. A1)') || 'GA';
    dispatch(buyTicket({ fixtureId, seat, price: 10 }));
  };

  /* ---------- helpers ---------- */
  const isFollowed = (teamId: string) => followedTeams.includes(teamId);

  return (
    <FanGuard>
      <UserHeader />
      {/* ------- HERO ------- */}
      <section className="team-theme py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <img src="https://via.placeholder.com/150" alt="Harvard Crimson" className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-white" />
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Harvard Crimson</h1>
          <p className="text-xl">Basketball Team - Ivy League Champions</p>
        </div>
      </section>

      {/* ------- TEAM STATS ------- */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 team-text">Team Statistics</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <StatCard label="Season Record" value="15-2" delay={0} />
            <StatCard label="Home Record" value="8-0" delay={200} />
            <StatCard label="Points Per Game" value="82.5" delay={400} />
            <StatCard label="Win Streak" value="7" delay={600} />
          </div>
        </div>
      </section>

      {/* ------- LIVE CHAT ------- */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8 team-text">Live Fan Chat</h2>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="h-64 overflow-y-auto mb-4 border border-gray-300 rounded p-4">
              <div className="chat-messages space-y-3">
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.user === user?.displayName ? 'justify-end' : 'justify-start'}`}>
                    <div className={`${msg.user === user?.displayName ? 'team-theme text-white' : 'bg-blue-100'} rounded-lg p-3 max-w-xs`}>
                      <p className="text-sm">{msg.text}</p>
                      <span className="text-xs opacity-80">- {msg.user} ({new Date(msg.createdAt).toLocaleTimeString()})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <form onSubmit={sendChat} className="flex space-x-2">
              <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} type="text" placeholder="Type your message..." className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="submit" className="team-theme text-white px-6 py-2 rounded-md hover:opacity-90">Send</button>
            </form>
          </div>
        </div>
      </section>

      {/* ------- MERCHANDISE ------- */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 team-text">Team Merchandise</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {merch.map((item: any) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden merch-item transition-all duration-300" data-aos="fade-up">
                <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 team-text">{item.name}</h3>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold team-text">${item.price}</span>
                    <button className="team-theme text-white px-4 py-2 rounded hover:opacity-90">Add to Cart</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------- UPCOMING GAMES ------- */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 team-text">Upcoming Games</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {upcoming.map((g, idx) => (
              <div key={g.id} className="bg-white rounded-lg shadow-md p-6" data-aos="fade-up" data-aos-delay={idx * 200}>
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">NEXT WEEK</span>
                  <span className="text-gray-600">{g.sport}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{g.homeTeamName} vs {g.awayTeamName}</h3>
                <p className="text-gray-600 mb-4">{new Date(g.scheduledAt).toLocaleDateString()} – {new Date(g.scheduledAt).toLocaleTimeString()}</p>
                <p className="text-gray-600 mb-4">{g.venue}</p>
                <div className="flex space-x-3">
                  <button onClick={() => buyTix(g.id)} className="block text-center team-theme text-white py-2 rounded hover:opacity-90 flex-1">Get Tickets</button>
                  <button onClick={() => follow(g.homeTeamId)} className={`px-4 py-2 rounded ${isFollowed(g.homeTeamId) ? 'bg-gray-400' : 'team-accent text-white hover:opacity-90'}`}>
                    {isFollowed(g.homeTeamId) ? 'Following' : 'Follow'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      
    </FanGuard>
  );
}

/* -----------------------------------
   Sub-components
----------------------------------- */
function StatCard({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <div className="text-center p-6 rounded-lg team-accent text-white" data-aos="fade-up" data-aos-delay={delay}>
      <div className="text-3xl font-bold mb-2">{value}</div>
      <p>{label}</p>
    </div>
  );
}
